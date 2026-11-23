import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data, error } = await locals.supabase.auth.getSession();
	if (error) throw error;
	if (!data.session) throw redirect(303, '/auth');
	const { data: userData, error: userError } = await locals.supabase.auth.getUser();
	if (userError) throw userError;
	if (!userData.user) throw redirect(303, '/auth');
};
