import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit/hooks';
import { dev } from '$app/env';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '$app/env/public';

export const handle: Handle = async ({ event, resolve }) => {
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
		throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured.');
	}

	event.locals.supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		cookieOptions: {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: !dev
		},
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				for (const { name, value, options } of cookiesToSet) {
					event.cookies.set(name, value, { ...options, path: '/' });
				}
			}
		}
	});

	return resolve(event);
};
