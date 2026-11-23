import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { userinfo } from '#lib/blizzard/userinfo.ts';
import { createSupabaseAdminClient } from '#lib/supabase/admin.ts';

const SYNC_INTERVAL_MS = 60 * 60 * 1000;

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	if (url.searchParams.has('error')) {
		throw redirect(303, '/auth?error=oauth_failed');
	}

	const code = url.searchParams.get('code');
	if (!code) throw new Error('Supabase auth callback did not include an authorization code.');

	const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);
	if (error) throw error;

	const session = data.session;
	const user = data.user;
	if (!session || !user) throw new Error('Supabase did not return an authenticated user session.');
	if (!session.provider_token) {
		throw new Error('Battle.net did not return an access token for the requested profile scope.');
	}

	const blizzardUser = await userinfo(session.provider_token);
	const displayName = blizzardUser.battletag.split('#')[0];
	const admin = createSupabaseAdminClient();
	const { data: profile, error: profileError } = await admin
		.from('profiles')
		.upsert(
			{
				id: user.id,
				blizzard_account_id: blizzardUser.sub,
				display_name: displayName,
				battle_tag: blizzardUser.battletag,
				locale: 'en_US',
				last_login_at: new Date().toISOString()
			},
			{ onConflict: 'id' }
		)
		.select('public_id')
		.single();
	if (profileError) throw profileError;

	const { error: metadataError } = await locals.supabase.auth.updateUser({
		data: {
			battletag: blizzardUser.battletag,
			display_name: displayName,
			public_profile_id: profile.public_id
		}
	});
	if (metadataError) throw metadataError;

	cookies.delete('token', { path: '/' });
	cookies.delete('id_token', { path: '/' });

	const { data: syncState, error: syncError } = await admin
		.from('user_sync_state')
		.select('last_successful_sync_at')
		.eq('user_id', user.id)
		.eq('resource', 'account-profile')
		.maybeSingle();
	if (syncError) throw syncError;

	const syncAge = syncState?.last_successful_sync_at
		? Date.now() - Date.parse(syncState.last_successful_sync_at)
		: Infinity;
	throw redirect(303, syncAge >= 0 && syncAge <= SYNC_INTERVAL_MS ? '/warband' : '/sync');
};
