import { logger, queue, task } from '@trigger.dev/sdk';
import { api, BATTLE_NET_LOCALE, BATTLE_NET_REGION } from '#lib/blizzard/api.ts';
import { userinfo } from '#lib/blizzard/userinfo.ts';
import type {
	Character,
	CharacterMedia,
	CharacterProfile,
	CharacterProfileProtected,
	CharacterProfessions
} from '#lib/blizzard/wow/profile.ts';
import { createSupabaseAdminClient } from '#lib/supabase/admin.ts';

export interface SyncAccountInput {
	token: string;
	user_id: string;
}

export interface SyncAccountOutput {
	accounts: { id: number }[];
	character_count: number;
}

interface CharacterSyncData {
	character: Character;
	profile: CharacterProfile | null;
	protectedProfile: CharacterProfileProtected | null;
	media: CharacterMedia | null;
	professions: CharacterProfessions | null;
}

function isSyncAccountInput(input: unknown): input is SyncAccountInput {
	if (!input || typeof input !== 'object') return false;
	const candidate = input as Record<string, unknown>;
	return (
		typeof candidate.token === 'string' &&
		candidate.token.length > 0 &&
		typeof candidate.user_id === 'string' &&
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
			candidate.user_id
		)
	);
}

function throwOnDatabaseError(result: { error: { message: string } | null }) {
	if (result.error) throw new Error(result.error.message);
}

function characterKey(region: string, realmId: number, characterId: number) {
	return `${region}:${realmId}:${characterId}`;
}

function guildKey(region: string, realmId: number, guildId: number) {
	return `${region}:${realmId}:${guildId}`;
}

const syncQueue = queue({
	name: 'sync',
	concurrencyLimit: 1
});

export const syncAccount = task({
	id: 'sync-account',
	maxDuration: 300,
	queue: syncQueue,
	run: async (payload: SyncAccountInput): Promise<SyncAccountOutput> => {
		if (!isSyncAccountInput(payload)) throw new Error('Invalid sync input.');

		const admin = createSupabaseAdminClient();
		const startedAt = new Date().toISOString();
		const syncState = {
			user_id: payload.user_id,
			resource: 'account-profile'
		};

		logger.log('START: sync-account', { user_id: payload.user_id });

		try {
			const { error: attemptError } = await admin.from('user_sync_state').upsert(
				{
					...syncState,
					last_attempt_at: startedAt,
					last_error: null
				},
				{ onConflict: 'user_id,resource' }
			);
			throwOnDatabaseError({ error: attemptError });

			await api.checkAuth();
			const [accountProfile, blizzardUser] = await Promise.all([
				api.profile(payload.token),
				userinfo(payload.token)
			]);

			const { data: profile, error: profileError } = await admin
				.from('profiles')
				.upsert(
					{
						id: payload.user_id,
						blizzard_account_id: blizzardUser.sub,
						display_name: blizzardUser.battletag.split('#')[0],
						battle_tag: blizzardUser.battletag,
						locale: BATTLE_NET_LOCALE
					},
					{ onConflict: 'id' }
				)
				.select('public_id')
				.single();
			if (profileError) throw profileError;

			const accountIds = accountProfile.wow_accounts.map(({ id }) => ({ id }));
			const characterData: CharacterSyncData[] = [];

			for (const account of accountProfile.wow_accounts) {
				for (const character of account.characters) {
					const [characterProfile, protectedProfile, media, professions] = await Promise.all([
						api.character.profile(character),
						api.character.protected(character, payload.token),
						api.character.media(character),
						api.character.professions(character)
					]);
					for (const [resource, value] of [
						['profile', characterProfile],
						['protected', protectedProfile],
						['media', media],
						['professions', professions]
					] as const) {
						if (value === null) {
							logger.warn('Character resource unavailable from Blizzard (404)', {
								character_id: character.id,
								realm_id: character.realm.id,
								resource
							});
						}
					}
					characterData.push({
						character,
						profile: characterProfile,
						protectedProfile,
						media,
						professions
					});
				}
			}

			const guildsByKey = new Map<
				string,
				{
					region: string;
					realm_id: number;
					blizzard_guild_id: number;
					name: string;
					realm: string;
				}
			>();

			for (const { profile: characterProfile } of characterData) {
				const guild = characterProfile?.guild;
				if (!guild) continue;
				guildsByKey.set(guildKey(BATTLE_NET_REGION, guild.realm.id, guild.id), {
					region: BATTLE_NET_REGION,
					realm_id: guild.realm.id,
					blizzard_guild_id: guild.id,
					name: guild.name,
					realm: guild.realm.name
				});
			}

			const guildIdsByKey = new Map<string, string>();
			if (guildsByKey.size > 0) {
				const { data: guildRows, error: guildError } = await admin
					.from('guilds')
					.upsert([...guildsByKey.values()], {
						onConflict: 'region,realm_id,blizzard_guild_id'
					})
					.select('id,region,realm_id,blizzard_guild_id');
				if (guildError) throw guildError;
				for (const guild of guildRows) {
					guildIdsByKey.set(
						guildKey(guild.region, guild.realm_id, guild.blizzard_guild_id),
						guild.id
					);
				}
			}

			const characterRows = characterData.map(({ character, profile: characterProfile }) => ({
				user_id: payload.user_id,
				public_profile_id: profile.public_id,
				blizzard_character_id: character.id,
				region: BATTLE_NET_REGION,
				realm_id: character.realm.id,
				name: character.name,
				realm: character.realm.name,
				class: characterProfile?.character_class.name ?? character.playable_class.name,
				race: characterProfile?.race.name ?? character.playable_race.name,
				gender: characterProfile?.gender.name ?? character.gender.name,
				faction: characterProfile?.faction.name ?? character.faction.name,
				level: characterProfile?.level ?? character.level
			}));

			const characterIdsByKey = new Map<string, string>();
			if (characterRows.length > 0) {
				const { data: characterRowsWithIds, error: characterError } = await admin
					.from('characters')
					.upsert(characterRows, {
						onConflict: 'user_id,region,realm_id,blizzard_character_id'
					})
					.select('id,region,realm_id,blizzard_character_id');
				if (characterError) throw characterError;
				for (const character of characterRowsWithIds) {
					characterIdsByKey.set(
						characterKey(character.region, character.realm_id, character.blizzard_character_id),
						character.id
					);
				}
			}

			const characterIds = characterData.map(({ character }) =>
				characterIdsByKey.get(characterKey(BATTLE_NET_REGION, character.realm.id, character.id))
			);
			if (characterIds.some((id) => !id)) {
				throw new Error('The database did not return an ID for every synced character.');
			}

			const extendedRows = characterData.flatMap(({ character, profile: characterProfile }) => {
				if (!characterProfile) return [];
				const guild = characterProfile.guild;
				const guildId = guild
					? guildIdsByKey.get(guildKey(BATTLE_NET_REGION, guild.realm.id, guild.id))
					: null;
				return [
					{
						character_id: characterIdsByKey.get(
							characterKey(BATTLE_NET_REGION, character.realm.id, character.id)
						)!,
						active_spec: characterProfile.active_spec?.name ?? null,
						guild_id: guildId ?? null,
						experience: characterProfile.experience,
						achievement_points: characterProfile.achievement_points,
						item_level: Math.round(characterProfile.equipped_item_level),
						title: characterProfile.active_title?.name ?? null,
						last_login_at: characterProfile.last_login_timestamp
							? new Date(characterProfile.last_login_timestamp).toISOString()
							: null
					}
				];
			});
			const protectedRows = characterData.flatMap(({ character, protectedProfile }) =>
				protectedProfile
					? [
							{
								character_id: characterIdsByKey.get(
									characterKey(BATTLE_NET_REGION, character.realm.id, character.id)
								)!,
								money: protectedProfile.money,
								deaths: protectedProfile.protected_stats.total_number_deaths,
								location_zone: protectedProfile.position.zone.name,
								location_map: protectedProfile.position.map.name,
								hearth_zone: protectedProfile.bind_position.zone.name,
								hearth_map: protectedProfile.bind_position.map.name
							}
						]
					: []
			);
			const mediaRows = characterData.flatMap(({ character, media }) => {
				if (!media) return [];
				const asset = (key: 'avatar' | 'inset' | 'main-raw') =>
					media.assets.find((entry) => entry.key === key)?.value ?? '';
				return [
					{
						character_id: characterIdsByKey.get(
							characterKey(BATTLE_NET_REGION, character.realm.id, character.id)
						)!,
						avatar: asset('avatar'),
						inset: asset('inset'),
						main_raw: asset('main-raw')
					}
				];
			});
			const professionRows = characterData.flatMap(({ character, professions }) =>
				professions
					? [
							{
								character_id: characterIdsByKey.get(
									characterKey(BATTLE_NET_REGION, character.realm.id, character.id)
								)!,
								primary_one: professions.primaries?.[0]?.profession.name ?? null,
								primary_two: professions.primaries?.[1]?.profession.name ?? null
							}
						]
					: []
			);

			if (extendedRows.length > 0) {
				const { error } = await admin
					.from('character_extended')
					.upsert(extendedRows, { onConflict: 'character_id' });
				throwOnDatabaseError({ error });
			}
			if (protectedRows.length > 0) {
				const { error } = await admin
					.from('character_protected')
					.upsert(protectedRows, { onConflict: 'character_id' });
				throwOnDatabaseError({ error });
			}
			if (mediaRows.length > 0) {
				const { error } = await admin
					.from('character_media')
					.upsert(mediaRows, { onConflict: 'character_id' });
				throwOnDatabaseError({ error });
			}
			if (professionRows.length > 0) {
				const { error } = await admin
					.from('character_professions')
					.upsert(professionRows, { onConflict: 'character_id' });
				throwOnDatabaseError({ error });
			}

			const completedAt = new Date().toISOString();
			const characterSyncRows = characterData.flatMap(
				({ character, profile, protectedProfile, media, professions }) => {
					const character_id = characterIdsByKey.get(
						characterKey(BATTLE_NET_REGION, character.realm.id, character.id)
					)!;
					const resources = [
						...(profile ? ['profile'] : []),
						...(protectedProfile ? ['protected'] : []),
						...(media ? ['media'] : []),
						...(professions ? ['professions'] : [])
					];
					return resources.map((resource) => ({
						character_id,
						resource,
						last_attempt_at: startedAt,
						last_successful_sync_at: completedAt,
						last_error: null
					}));
				}
			);
			if (characterSyncRows.length > 0) {
				const { error: characterSyncError } = await admin
					.from('character_sync_state')
					.upsert(characterSyncRows, { onConflict: 'character_id,resource' });
				throwOnDatabaseError({ error: characterSyncError });
			}

			const unavailableResources = characterData.flatMap(
				({ character, profile, protectedProfile, media, professions }) => {
					const character_id = characterIdsByKey.get(
						characterKey(BATTLE_NET_REGION, character.realm.id, character.id)
					)!;
					const resources = [
						...(!profile ? ['profile'] : []),
						...(!protectedProfile ? ['protected'] : []),
						...(!media ? ['media'] : []),
						...(!professions ? ['professions'] : [])
					];
					return resources.map((resource) => ({
						character_id,
						resource,
						last_attempt_at: startedAt,
						last_error: `Blizzard returned 404 for character ${resource}.`
					}));
				}
			);
			if (unavailableResources.length > 0) {
				const { error } = await admin
					.from('character_sync_state')
					.upsert(unavailableResources, { onConflict: 'character_id,resource' });
				throwOnDatabaseError({ error });
			}

			const { error: successError } = await admin.from('user_sync_state').upsert(
				{
					...syncState,
					last_attempt_at: startedAt,
					last_successful_sync_at: completedAt,
					account_count: accountIds.length,
					last_error: null
				},
				{ onConflict: 'user_id,resource' }
			);
			throwOnDatabaseError({ error: successError });

			logger.log('FINISH: sync-account', {
				user_id: payload.user_id,
				character_count: characterData.length
			});
			return {
				accounts: accountIds,
				character_count: characterData.length
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			const { error: stateError } = await admin.from('user_sync_state').upsert(
				{
					...syncState,
					last_attempt_at: startedAt,
					last_error: message
				},
				{ onConflict: 'user_id,resource' }
			);
			if (stateError) {
				logger.log('Unable to record sync failure', {
					user_id: payload.user_id,
					error: stateError.message
				});
			}
			throw error;
		}
	}
});
