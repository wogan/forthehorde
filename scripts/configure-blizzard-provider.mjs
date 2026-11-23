import { createClient } from '@supabase/supabase-js';

const required = [
	'SUPABASE_URL',
	'SUPABASE_SERVICE_ROLE_KEY',
	'BATTLE_NET_CLIENT_ID',
	'BATTLE_NET_CLIENT_SECRET'
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
	throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const supabaseUrl = new URL(process.env.SUPABASE_URL);
if (!['localhost', '127.0.0.1'].includes(supabaseUrl.hostname)) {
	throw new Error('This script only configures a local Supabase instance.');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		detectSessionInUrl: false,
		persistSession: false
	}
});

const provider = {
	provider_type: 'oauth2',
	identifier: 'custom:blizzard-oauth2',
	name: 'Battle.net',
	client_id: process.env.BATTLE_NET_CLIENT_ID,
	client_secret: process.env.BATTLE_NET_CLIENT_SECRET,
	authorization_url: 'https://oauth.battle.net/authorize',
	token_url: 'https://oauth.battle.net/token',
	userinfo_url: 'https://oauth.battle.net/userinfo',
	scopes: ['openid', 'wow.profile'],
	email_optional: true,
	pkce_enabled: true,
	enabled: true
};

const { data, error: listError } = await supabase.auth.admin.customProviders.listProviders({
	type: 'oauth2'
});
if (listError) throw listError;

const existing = data.providers.find(({ identifier }) => identifier === provider.identifier);
const result = existing
	? await supabase.auth.admin.customProviders.updateProvider(provider.identifier, {
			name: provider.name,
			client_id: provider.client_id,
			client_secret: provider.client_secret,
			authorization_url: provider.authorization_url,
			token_url: provider.token_url,
			userinfo_url: provider.userinfo_url,
			scopes: provider.scopes,
			email_optional: provider.email_optional,
			pkce_enabled: provider.pkce_enabled,
			enabled: provider.enabled
		})
	: await supabase.auth.admin.customProviders.createProvider(provider);

if (result.error) throw result.error;
console.log('Configured the custom:blizzard-oauth2 provider.');
