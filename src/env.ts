import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	BATTLE_NET_CLIENT_ID: {},
	BATTLE_NET_CLIENT_SECRET: {},
	TRIGGER_SECRET_KEY: {},
	VERCEL_PROJECT_PRODUCTION_URL: {}
});
