import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Character } from './wow/profile';

const mocks = vi.hoisted(() => ({
	profile: vi.fn(),
	protected: vi.fn(),
	media: vi.fn(),
	professions: vi.fn()
}));

vi.mock('blizzard.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('blizzard.js')>();
	return {
		...actual,
		wow: {
			...actual.wow,
			createInstance: vi.fn().mockResolvedValue({
				characterProfile: mocks.profile,
				accountCharacterProfile: mocks.protected,
				characterMedia: mocks.media,
				characterProfessions: mocks.professions
			})
		}
	};
});

import { core } from 'blizzard.js';
import { api } from './api';

const character = { name: 'Example', realm: { slug: 'example-realm' } } as Character;

function responseError(status: number) {
	return new core.ResponseError({ status, statusText: '', data: {}, headers: {} });
}

describe('character professions', () => {
	beforeEach(() => {
		for (const request of Object.values(mocks)) request.mockReset();
	});

	it('returns the Blizzard response when available', async () => {
		const professions = { primaries: [{ profession: { name: 'Alchemy' } }] };
		mocks.professions.mockResolvedValue({ data: professions });
		await expect(api.character.professions(character)).resolves.toEqual(professions);
	});

	it('reports a 404 as unavailable', async () => {
		mocks.professions.mockRejectedValue(responseError(404));
		await expect(api.character.professions(character)).resolves.toBeNull();
	});

	it('propagates other Blizzard errors', async () => {
		const error = responseError(500);
		mocks.professions.mockRejectedValue(error);
		await expect(api.character.professions(character)).rejects.toBe(error);
	});

	it.each([
		['profile', () => api.character.profile(character), mocks.profile],
		['protected', () => api.character.protected(character, 'token'), mocks.protected],
		['media', () => api.character.media(character), mocks.media]
	])('treats a 404 for %s as unavailable', async (_name, request, mock) => {
		mock.mockRejectedValue(responseError(404));
		await expect(request()).resolves.toBeNull();
	});
});
