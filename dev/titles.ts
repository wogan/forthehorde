import { core, wow } from 'blizzard.js';
import type { Title, TitleIndex } from '../src/lib/blizzard/wow/title';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import pRetry from 'p-retry';

type ResourceResponse<T> = Promise<{ data: T }>;

/*
Mostly just a proof of concept script to be able to use lib scrips
*/

const CLIENT_ID = process.env.BATTLE_NET_CLIENT_ID;
const CLIENT_SECRET = process.env.BATTLE_NET_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
	console.error('Missing BATTLE_NET_CLIENT_ID or BATTLE_NET_CLIENT_SECRET environment variables');
	process.exit(1);
}

const limiter = new RateLimiterMemory({
	points: 100,
	duration: 1
});

const wowClient = await wow.createInstance(
	{
		key: CLIENT_ID,
		secret: CLIENT_SECRET,
		origin: 'us',
		locale: 'en_US'
	},
	true
);

async function run<T>(request: () => ResourceResponse<T>): Promise<T> {
	return await pRetry(
		async () => {
			await limiter.consume('key', 1);
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
				error instanceof core.ResponseError && [401, 429].includes(error.response.status)
		}
	);
}

async function callApi() {
	try {
		const response = await run(() => wowClient.title<TitleIndex>());
		const seen: Set<string> = new Set();
		for (const t of response.titles) {
			const detail = await run(() => wowClient.title<Title>({ id: t.id }));
			if (typeof detail.source === 'undefined') {
				continue;
			}
			const type = detail.source?.type?.type;
			if (typeof type === 'undefined') {
				console.log(detail);
				continue;
			}
			if (!seen.has(type)) {
				console.log(detail.source);
				seen.add(type);
			}
		}
	} catch (error) {
		console.error('Error calling API:', error);
	}
}

callApi();
