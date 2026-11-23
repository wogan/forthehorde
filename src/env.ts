import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	BATTLE_NET_CLIENT_ID: {},
	BATTLE_NET_CLIENT_SECRET: {},
	SUPABASE_URL: { public: true, schema: (value) => value },
	SUPABASE_PUBLISHABLE_KEY: { public: true, schema: (value) => value },
	SUPABASE_SERVICE_ROLE_KEY: { schema: (value) => value },
	TRIGGER_SECRET_KEY: {}
});
