import { redirect } from '@sveltejs/kit';
import type { Character } from '#lib/model.ts';
import { createSupabaseAdminClient } from '#lib/supabase/admin.ts';

export const load = async ({ locals }) => {
	const {
		data: { session },
		error: sessionError
	} = await locals.supabase.auth.getSession();
	if (sessionError) throw sessionError;
	if (!session) throw redirect(303, '/auth');

	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();
	if (userError) throw userError;
	if (!user) throw redirect(303, '/auth');

	const admin = createSupabaseAdminClient();
	const { data: profile, error: profileError } = await admin
		.from('profiles')
		.select('public_id')
		.eq('id', user.id)
		.single();
	if (profileError) throw profileError;
	const { data: syncState, error: syncError } = await admin
		.from('user_sync_state')
		.select('account_count')
		.eq('user_id', user.id)
		.eq('resource', 'account-profile')
		.maybeSingle();
	if (syncError) throw syncError;

	const { data: characterRows, error: charactersError } = await locals.supabase
		.from('characters')
		.select('id,blizzard_character_id,name,realm,class,race,level,gender,faction')
		.eq('public_profile_id', profile.public_id)
		.order('level', { ascending: false });
	if (charactersError) throw charactersError;

	const ids = characterRows.map(({ id }) => id);
	let extendedRows: {
		character_id: string;
		active_spec: string | null;
		guild_id: string | null;
	}[] = [];
	let mediaRows: {
		character_id: string;
		avatar: string;
		inset: string;
		main_raw: string;
	}[] = [];
	let guildRows: { id: string; name: string }[] = [];
	let unavailableDetailsCount = 0;

	if (ids.length > 0) {
		const { data: unavailable, error: detailError } = await admin
			.from('character_sync_state')
			.select('character_id')
			.in('character_id', ids)
			.in('resource', ['profile', 'protected', 'media', 'professions'])
			.not('last_error', 'is', null);
		if (detailError) throw detailError;
		unavailableDetailsCount = new Set(unavailable.map((row) => row.character_id)).size;

		const { data, error } = await locals.supabase
			.from('character_extended')
			.select('character_id,active_spec,guild_id')
			.in('character_id', ids);
		if (error) throw error;
		extendedRows = data;

		const { data: media, error: mediaError } = await locals.supabase
			.from('character_media')
			.select('character_id,avatar,inset,main_raw')
			.in('character_id', ids);
		if (mediaError) throw mediaError;
		mediaRows = media;

		const guildIds = [
			...new Set(extendedRows.flatMap((row) => (row.guild_id ? [row.guild_id] : [])))
		];
		if (guildIds.length > 0) {
			const { data: guilds, error: guildError } = await locals.supabase
				.from('guilds')
				.select('id,name')
				.in('id', guildIds);
			if (guildError) throw guildError;
			guildRows = guilds;
		}
	}

	const extendedById = new Map(extendedRows.map((row) => [row.character_id, row]));
	const mediaById = new Map(mediaRows.map((row) => [row.character_id, row]));
	const guildById = new Map(guildRows.map((row) => [row.id, row]));
	const characters: Character[] = characterRows.map((row) => {
		const extended = extendedById.get(row.id);
		const media = mediaById.get(row.id);
		return {
			id: Number(row.blizzard_character_id),
			name: row.name,
			realm: row.realm,
			cls: row.class,
			race: row.race,
			level: row.level,
			gender: row.gender,
			faction: row.faction,
			extra: Promise.resolve({
				spec: extended?.active_spec ?? undefined,
				guild: extended?.guild_id ? guildById.get(extended.guild_id)?.name : undefined
			}),
			media: Promise.resolve({
				main: media?.main_raw ?? '',
				avatar: media?.avatar ?? '',
				inset: media?.inset ?? ''
			})
		};
	});

	return {
		characters,
		accountCount: syncState?.account_count ?? null,
		unavailableDetailsCount
	};
};
