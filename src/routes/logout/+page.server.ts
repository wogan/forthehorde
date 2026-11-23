import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		const { error } = await locals.supabase.auth.signOut();
		if (error) throw error;

		cookies.delete('token', { path: '/' });
		cookies.delete('id_token', { path: '/' });

		throw redirect(303, '/');
	}
};
