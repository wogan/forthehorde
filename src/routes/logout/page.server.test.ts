import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';

describe('logout action', () => {
	it('signs out and redirects to the home page', async () => {
		const signOut = vi.fn().mockResolvedValue({ error: null });
		const cookies = { delete: vi.fn() };
		const event = {
			locals: { supabase: { auth: { signOut } } },
			cookies
		} as unknown as Parameters<NonNullable<typeof actions.default>>[0];

		await expect(actions.default!(event)).rejects.toMatchObject({ status: 303, location: '/' });
		expect(signOut).toHaveBeenCalledOnce();
		expect(cookies.delete).toHaveBeenCalledWith('token', { path: '/' });
		expect(cookies.delete).toHaveBeenCalledWith('id_token', { path: '/' });
	});

	it('surfaces sign-out errors instead of redirecting', async () => {
		const failure = new Error('Sign-out failed');
		const event = {
			locals: { supabase: { auth: { signOut: vi.fn().mockResolvedValue({ error: failure }) } } }
		} as unknown as Parameters<NonNullable<typeof actions.default>>[0];

		await expect(actions.default!(event)).rejects.toThrow('Sign-out failed');
	});
});
