import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	run: undefined as ((payload: { token: string; user_id: string }) => Promise<unknown>) | undefined,
	writes: [] as { table: string; rows: unknown }[],
	professions: vi.fn(),
	profile: vi.fn(),
	protectedProfile: vi.fn(),
	media: vi.fn(),
	warn: vi.fn()
}));

vi.mock('@trigger.dev/sdk', () => ({
	task: (options: { run: typeof mocks.run }) => {
		mocks.run = options.run;
		return options;
	},
	queue: vi.fn(),
	logger: { log: vi.fn(), warn: mocks.warn }
}));

vi.mock('#lib/blizzard/api.ts', () => ({
	BATTLE_NET_REGION: 'us',
	BATTLE_NET_LOCALE: 'en_US',
	api: {
		checkAuth: vi.fn(),
		profile: vi.fn().mockResolvedValue({
			wow_accounts: [
				{
					id: 1,
					characters: [
						{
							id: 2,
							name: 'Example',
							realm: { id: 3, name: 'Realm' },
							playable_class: { name: 'Mage' },
							playable_race: { name: 'Orc' },
							gender: { name: 'Male' },
							faction: { name: 'Horde' },
							level: 14
						}
					]
				}
			]
		}),
		character: {
			profile: mocks.profile,
			protected: mocks.protectedProfile,
			media: mocks.media,
			professions: mocks.professions
		}
	}
}));

vi.mock('#lib/blizzard/userinfo.ts', () => ({
	userinfo: vi.fn().mockResolvedValue({ sub: 'account', battletag: 'User#1234' })
}));

vi.mock('#lib/supabase/admin.ts', () => ({
	createSupabaseAdminClient: () => ({
		from: (table: string) => ({
			upsert: (rows: unknown) => {
				mocks.writes.push({ table, rows });
				return Object.assign(Promise.resolve({ error: null }), {
					select: () =>
						table === 'profiles'
							? { single: async () => ({ data: { public_id: 'public' }, error: null }) }
							: Promise.resolve({
									data: [{ id: 'character', region: 'us', realm_id: 3, blizzard_character_id: 2 }],
									error: null
								})
				});
			}
		})
	})
}));

import './trigger/sync';

describe('syncing unavailable professions', () => {
	beforeEach(() => {
		mocks.writes.length = 0;
		mocks.professions.mockReset();
		mocks.warn.mockReset();
		mocks.profile.mockReset().mockResolvedValue({
			character_class: { name: 'Mage' },
			race: { name: 'Orc' },
			gender: { name: 'Male' },
			faction: { name: 'Horde' },
			level: 80,
			experience: 0,
			achievement_points: 10,
			equipped_item_level: 100
		});
		mocks.protectedProfile.mockReset().mockResolvedValue({
			money: 10,
			protected_stats: { total_number_deaths: 2 },
			position: { zone: { name: 'Zone' }, map: { name: 'Map' } },
			bind_position: { zone: { name: 'Zone' }, map: { name: 'Map' } }
		});
		mocks.media.mockReset().mockResolvedValue({ assets: [] });
	});

	it('preserves stored professions and records the resource failure', async () => {
		mocks.professions.mockResolvedValue(null);
		await mocks.run!({ token: 'token', user_id: '12345678-1234-4234-8234-123456789012' });

		expect(mocks.writes.some(({ table }) => table === 'character_professions')).toBe(false);
		expect(mocks.warn).toHaveBeenCalledOnce();
		const stateWrites = mocks.writes.filter(({ table }) => table === 'character_sync_state');
		expect(stateWrites[0].rows).not.toContainEqual(
			expect.objectContaining({ resource: 'professions' })
		);
		expect(stateWrites[1].rows).toContainEqual(
			expect.objectContaining({
				character_id: 'character',
				resource: 'professions',
				last_error: 'Blizzard returned 404 for character professions.'
			})
		);
	});

	it('writes professions and clears a previous failure when available', async () => {
		mocks.professions.mockResolvedValue({ primaries: [{ profession: { name: 'Alchemy' } }] });
		await mocks.run!({ token: 'token', user_id: '12345678-1234-4234-8234-123456789012' });

		expect(mocks.writes.find(({ table }) => table === 'character_professions')?.rows).toEqual([
			{ character_id: 'character', primary_one: 'Alchemy', primary_two: null }
		]);
		expect(mocks.writes.find(({ table }) => table === 'character_sync_state')?.rows).toContainEqual(
			expect.objectContaining({ resource: 'professions', last_error: null })
		);
	});

	it('keeps the basic character when all detail resources are unavailable', async () => {
		mocks.profile.mockResolvedValue(null);
		mocks.protectedProfile.mockResolvedValue(null);
		mocks.media.mockResolvedValue(null);
		mocks.professions.mockResolvedValue(null);
		await mocks.run!({ token: 'token', user_id: '12345678-1234-4234-8234-123456789012' });

		expect(mocks.writes.find(({ table }) => table === 'characters')?.rows).toEqual([
			expect.objectContaining({ name: 'Example', level: 14, class: 'Mage', race: 'Orc' })
		]);
		for (const table of [
			'character_extended',
			'character_protected',
			'character_media',
			'character_professions'
		]) {
			expect(mocks.writes.some((write) => write.table === table)).toBe(false);
		}
		const errors = mocks.writes.find(({ table }) => table === 'character_sync_state')?.rows;
		expect(errors).toEqual(
			expect.arrayContaining(
				['profile', 'protected', 'media', 'professions'].map((resource) =>
					expect.objectContaining({ resource, last_error: expect.stringContaining('404') })
				)
			)
		);
	});
});
