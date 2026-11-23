import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	userinfo: vi.fn(),
	from: vi.fn()
}));

vi.mock('#lib/blizzard/userinfo.ts', () => ({ userinfo: mocks.userinfo }));
vi.mock('#lib/supabase/admin.ts', () => ({
	createSupabaseAdminClient: () => ({ from: mocks.from })
}));

import { GET } from './+server';

function event() {
	return {
		url: new URL('http://localhost/auth/callback?code=auth-code'),
		cookies: { delete: vi.fn() },
		locals: {
			supabase: {
				auth: {
					exchangeCodeForSession: vi.fn().mockResolvedValue({
						data: { session: { provider_token: 'token' }, user: { id: 'user-1' } },
						error: null
					}),
					updateUser: vi.fn().mockResolvedValue({ error: null })
				}
			}
		}
	} as unknown as Parameters<typeof GET>[0];
}

describe('authentication callback sync routing', () => {
	const now = new Date('2026-11-23T01:00:00Z');
	const eq = vi.fn();
	const maybeSingle = vi.fn();

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
		mocks.userinfo.mockResolvedValue({ sub: 'account-1', battletag: 'User#1234' });
		eq.mockReturnThis();
		mocks.from.mockImplementation((table: string) => {
			if (table === 'profiles') {
				return {
					upsert: () => ({
						select: () => ({
							single: async () => ({ data: { public_id: 'profile-1' }, error: null })
						})
					})
				};
			}
			if (table === 'user_sync_state') {
				return { select: () => ({ eq, maybeSingle }) };
			}
			throw new Error(`Unexpected table: ${table}`);
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.resetAllMocks();
	});

	it.each([
		['a recent sync', '2026-11-23T00:59:59Z', '/warband'],
		['a sync exactly one hour ago', '2026-11-23T00:00:00Z', '/warband'],
		['an older sync', '2026-11-22T23:59:59Z', '/sync'],
		['a future timestamp', '2026-11-23T01:00:01Z', '/sync'],
		['no successful sync', null, '/sync']
	])('routes after %s', async (_description, timestamp, destination) => {
		maybeSingle.mockResolvedValue({
			data: timestamp ? { last_successful_sync_at: timestamp } : null,
			error: null
		});

		await expect(GET(event())).rejects.toMatchObject({ status: 303, location: destination });
		expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
		expect(eq).toHaveBeenCalledWith('resource', 'account-profile');
	});

	it('surfaces errors reading sync state', async () => {
		const error = new Error('Database unavailable');
		maybeSingle.mockResolvedValue({ data: null, error });

		await expect(GET(event())).rejects.toBe(error);
	});
});
