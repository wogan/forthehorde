import { core } from 'blizzard.js';
import { Character } from '#lib/model.ts';
import { api } from '#lib/blizzard/api.ts';
import type { CharacterAsset, CharacterMedia } from '#lib/blizzard/wow/profile.ts';
import { configure } from '@trigger.dev/sdk/v3';
import { TRIGGER_SECRET_KEY } from '$app/env/private';

function transformMedia(media: CharacterMedia): Awaited<Character['media']> {
	const f = (s: CharacterAsset) => media.assets.find((a) => a.key === s)?.value ?? '';
	return {
		main: f('main-raw'),
		avatar: f('avatar'),
		inset: f('inset')
	};
}

// TODO do this during build? sveltekit plugin?
configure({
	secretKey: TRIGGER_SECRET_KEY
});

export const load = async ({ cookies }) => {
	const token = cookies.get('token');
	if (typeof token == 'undefined') {
		return {
			characters: [] as Character[]
		};
	}
	const characters: Character[] = [];
	const accounts = [];
	try {
		await api.checkAuth();
		const profile = await api.profile(token);
		// triggerAccountSync(token, profile);
		// return runId as page data -> effect on the page to connect to stream endpoint
		for (const account of profile.wow_accounts) {
			const cx = account.characters.map((c) =>
				Character(
					c,
					account.id,
					api.character
						.profile(c)
						.then((p) => ({ guild: p.guild?.name, spec: p.active_spec?.name }))
						.catch(() => ({})),
					api.character
						.media(c)
						.then(transformMedia)
						.catch(() => ({ main: '', inset: '', avatar: '' })) // todo construct default urls
				)
			);
			characters.push(...cx);
			accounts.push({
				id: account.id
			});
		}
	} catch (error) {
		if (error instanceof core.ResponseError) {
			console.log('Unable to load profile details', error.message);
		}
	}
	return {
		characters,
		accounts
	};
};
