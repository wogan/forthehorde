import { configure, runs } from '@trigger.dev/sdk';
import { json } from '@sveltejs/kit';
import { dev } from '$app/env';
import { TRIGGER_SECRET_KEY } from '$app/env/private';
import { syncAccount } from '#lib/trigger/sync.ts';
import type { RequestEvent, RequestHandler } from './$types';

configure({ secretKey: TRIGGER_SECRET_KEY });

const cookieName = 'sync_run';
const cookieOptions = { path: '/sync', httpOnly: true, sameSite: 'lax' as const, secure: !dev };

async function authenticatedUser(event: RequestEvent) {
	const { data, error: sessionError } = await event.locals.supabase.auth.getSession();
	if (sessionError) throw sessionError;
	if (!data.session) return null;

	const { data: userData, error: userError } = await event.locals.supabase.auth.getUser();
	if (userError) throw userError;
	if (!userData.user) return null;
	return { user: userData.user, session: data.session };
}

async function ownedRun(id: string, userId: string) {
	const run = await runs.retrieve(id);
	if (run.taskIdentifier !== 'sync-account' || !run.tags.includes(`sync-user:${userId}`)) {
		return null;
	}
	return run;
}

export const POST: RequestHandler = async (event) => {
	const auth = await authenticatedUser(event);
	if (!auth) return json({ error: 'Please sign in before syncing.' }, { status: 401 });

	const currentRun = event.cookies.get(cookieName);
	if (currentRun) {
		const run = await ownedRun(currentRun, auth.user.id);
		if (run && (!run.isCompleted || run.isSuccess)) return json({ started: true });
		event.cookies.delete(cookieName, { path: '/sync' });
	}

	if (!auth.session.provider_token) {
		const { error } = await event.locals.supabase.auth.signOut();
		if (error) throw error;
		return json(
			{ error: 'Your Battle.net session expired. Please sign in again.' },
			{ status: 401 }
		);
	}

	const handle = await syncAccount.trigger(
		{ token: auth.session.provider_token, user_id: auth.user.id },
		{ tags: [`sync-user:${auth.user.id}`] }
	);
	event.cookies.set(cookieName, handle.id, { ...cookieOptions, maxAge: 60 * 60 });
	return json({ started: true });
};

export const GET: RequestHandler = async (event) => {
	const auth = await authenticatedUser(event);
	if (!auth) return json({ error: 'Please sign in before syncing.' }, { status: 401 });

	const id = event.cookies.get(cookieName);
	if (!id) return json({ error: 'No sync is in progress.' }, { status: 404 });
	const run = await ownedRun(id, auth.user.id);
	if (!run) {
		event.cookies.delete(cookieName, { path: '/sync' });
		return json({ error: 'Sync run not found.' }, { status: 404 });
	}

	if (!run.isCompleted) return json({ status: 'running' });
	event.cookies.delete(cookieName, { path: '/sync' });
	if (!run.isSuccess) {
		console.error('Account sync failed', { runId: run.id, status: run.status, error: run.error });
		return json({ status: 'failed', error: `Sync failed (${run.status}). Please retry.` });
	}
	return json({ status: 'completed' });
};
