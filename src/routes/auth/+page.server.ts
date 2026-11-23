import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	if (url.searchParams.has('error')) {
		return { error: 'Battle.net sign-in was not completed.' };
	}

	const {
		data: { session },
		error: sessionError
	} = await locals.supabase.auth.getSession();
	if (sessionError) throw sessionError;

	if (session) {
		const {
			data: { user },
			error: userError
		} = await locals.supabase.auth.getUser();
		if (userError) throw userError;
		if (user) throw redirect(303, '/warband');
	}

	const { data, error } = await locals.supabase.auth.signInWithOAuth({
		provider: 'custom:blizzard-oauth2',
		options: {
			redirectTo: new URL('/auth/callback', url).toString(),
			scopes: 'openid wow.profile'
		}
	});
	if (error) throw error;
	if (!data.url) throw new Error('Supabase did not return a Blizzard sign-in URL.');

	throw redirect(303, data.url, { external: true });
};
