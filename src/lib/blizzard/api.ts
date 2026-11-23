import { core, wow } from 'blizzard.js';
import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET } from '$app/env/private';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import pRetry from 'p-retry';
import type { Title, TitleIndex } from './wow/title';
import type {
	Character,
	CharacterMedia,
	CharacterProfile,
	Profile,
	PlayableClassIndex,
	PlayableClass,
	PlayableClassMedia,
	PlayableRace,
	PlayableRaceIndex,
	PlayableSpecializationIndex,
	PlayableSpecialization,
	PlayableSpecializationMedia,
	PowerTypeIndex,
	PowerType,
	RealmIndex,
	Realm,
	RegionIndex,
	Region,
	CharacterProfileProtected,
	CharacterSpecialization,
	CharacterProfessions
} from './wow';

type ResourceResponse<T> = Promise<{ data: T }>;

const limiter = new RateLimiterMemory({
	points: 100,
	duration: 1
});

export const BATTLE_NET_REGION = 'us';
export const BATTLE_NET_LOCALE = 'en_US';

const wowClient = await wow.createInstance(
	{
		key: BATTLE_NET_CLIENT_ID,
		secret: BATTLE_NET_CLIENT_SECRET,
		origin: BATTLE_NET_REGION,
		locale: BATTLE_NET_LOCALE
	},
	false
);

class RateLimited extends Error {
	rate_limited: boolean = true;
}

async function run<T>(request: () => ResourceResponse<T>): Promise<T> {
	return await pRetry(
		async () => {
			try {
				await limiter.consume('key', 1);
			} catch (e) {
				if (e instanceof RateLimiterRes) {
					throw new RateLimited('rate limited');
				}
			}
			const response = await request();
			return response.data;
		},
		{
			retries: 3,
			onFailedAttempt: async ({ error }) => {
				if (error instanceof core.ResponseError && error.response.status === 401) {
					await wowClient.refreshApplicationToken();
				}
			},
			shouldRetry: ({ error }) =>
				error instanceof RateLimited ||
				(error instanceof core.ResponseError && [401, 429].includes(error.response.status))
		}
	);
}

async function checkAuth() {
	try {
		const currentToken = wowClient.defaults.token;
		if (typeof currentToken === 'undefined') {
			await wowClient.refreshApplicationToken();
		} else {
			await wowClient.validateApplicationToken();
		}
	} catch (error) {
		if (error instanceof core.ResponseError && error.response.status === 401) {
			await wowClient.refreshApplicationToken();
		}
	}
}

const charToNameRealm = (char: Character) => ({
	name: char.name.toLowerCase(),
	realm: char.realm.slug
});

async function optionalCharacterResource<T>(request: () => ResourceResponse<T>): Promise<T | null> {
	try {
		return await run(request);
	} catch (error) {
		if (error instanceof core.ResponseError && error.response.status === 404) return null;
		throw error;
	}
}

export const api = {
	checkAuth,
	profile: (token: string) => run(() => wowClient.accountProfile<Profile>({ token })),
	character: {
		profile: (char: Character) =>
			optionalCharacterResource(() =>
				wowClient.characterProfile<CharacterProfile>(charToNameRealm(char))
			),
		protected: (char: Character, token: string) =>
			optionalCharacterResource(() =>
				wowClient.accountCharacterProfile<CharacterProfileProtected>({
					character: char.id,
					realm: char.realm.id,
					token
				})
			),
		media: (char: Character) =>
			optionalCharacterResource(() =>
				wowClient.characterMedia<CharacterMedia>(charToNameRealm(char))
			),
		professions: (char: Character) =>
			optionalCharacterResource(() =>
				wowClient.characterProfessions<CharacterProfessions>(charToNameRealm(char))
			),
		spec: (char: Character) =>
			run(() => wowClient.characterSpecializations<CharacterSpecialization>(charToNameRealm(char)))
	},
	title: {
		index: () => run(() => wowClient.title<TitleIndex>()),
		detail: (id: number) => run(() => wowClient.title<Title>({ id }))
	},
	class: {
		index: () => run(() => wowClient.playableClass<PlayableClassIndex>()),
		detail: (id: number) => run(() => wowClient.playableClass<PlayableClass>({ id })),
		media: (id: number) =>
			run(() => wowClient.playableClass<PlayableClassMedia>({ id, media: true }))
	},
	race: {
		index: () => run(() => wowClient.playableRace<PlayableRaceIndex>()),
		detail: (id: number) => run(() => wowClient.playableRace<PlayableRace>({ id }))
	},
	spec: {
		index: () => run(() => wowClient.playableSpecialization<PlayableSpecializationIndex>()),
		detail: (id: number) =>
			run(() => wowClient.playableSpecialization<PlayableSpecialization>({ id })),
		media: (id: number) =>
			run(() => wowClient.playableSpecialization<PlayableSpecializationMedia>({ id, media: true }))
	},
	power: {
		index: () => run(() => wowClient.powerType<PowerTypeIndex>()),
		detail: (id: number) => run(() => wowClient.playableRace<PowerType>({ id }))
	},
	realm: {
		index: () => run(() => wowClient.realm<RealmIndex>()),
		detail: (slug: string) => wowClient.realm<Realm>({ slug })
	},
	region: {
		index: () => run(() => wowClient.region<RegionIndex>()),
		detail: (id: number) => wowClient.region<Region>({ id })
	}
} as const;
