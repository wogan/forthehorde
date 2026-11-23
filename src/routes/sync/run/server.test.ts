import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	retrieve: vi.fn(),
	trigger: vi.fn()
}));

vi.mock('@trigger.dev/sdk', () => ({
	configure: vi.fn(),
	runs: { retrieve: mocks.retrieve }
}));
vi.mock('#lib/trigger/sync.ts', () => ({
	syncAccount: { trigger: mocks.trigger }
}));

import { GET, POST } from './+server';

function event(options: { runId?: string; token?: string | null; userId?: string } = {}) {
	const values = new Map<string, string>();
	if (options.runId) values.set('sync_run', options.runId);
	const cookies = {
		get: vi.fn((name: string) => values.get(name)),
		set: vi.fn((name: string, value: string) => values.set(name, value)),
		delete: vi.fn((name: string) => values.delete(name))
	};
	const signOut = vi.fn().mockResolvedValue({ error: null });
	const auth = {
		getSession: vi.fn().mockResolvedValue({
			data: { session: { provider_token: options.token === undefined ? 'token' : options.token } },
			error: null
		}),
		getUser: vi.fn().mockResolvedValue({
			data: { user: { id: options.userId ?? 'user-1' } },
			error: null
		}),
		signOut
	};
	return {
		request: {
			url: new URL('http://localhost/sync/run'),
			cookies,
			locals: { supabase: { auth } }
		} as unknown as Parameters<typeof POST>[0],
		cookies,
		signOut
	};
}

describe('sync task endpoint', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('starts an owned run and keeps its ID in an HttpOnly cookie', async () => {
		mocks.trigger.mockResolvedValue({ id: 'run-1' });
		const { request, cookies } = event();
		const response = await POST(request);
		expect(response.status).toBe(200);
		expect(mocks.trigger).toHaveBeenCalledWith(
			{ token: 'token', user_id: 'user-1' },
			{ tags: ['sync-user:user-1'] }
		);
		expect(cookies.set).toHaveBeenCalledWith(
			'sync_run',
			'run-1',
			expect.objectContaining({ httpOnly: true, path: '/sync' })
		);
	});

	it('resumes an existing owned run instead of starting another', async () => {
		mocks.retrieve.mockResolvedValue({
			taskIdentifier: 'sync-account',
			tags: ['sync-user:user-1'],
			isCompleted: false
		});
		const { request } = event({ runId: 'run-1' });
		expect((await POST(request)).status).toBe(200);
		expect(mocks.trigger).not.toHaveBeenCalled();
	});

	it('does not disclose or reuse another user’s run', async () => {
		mocks.retrieve.mockResolvedValue({
			taskIdentifier: 'sync-account',
			tags: ['sync-user:other'],
			isCompleted: true,
			isSuccess: true
		});
		const { request, cookies } = event({ runId: 'run-other' });
		const response = await GET(request);
		expect(response.status).toBe(404);
		expect(cookies.delete).toHaveBeenCalledWith('sync_run', { path: '/sync' });
	});

	it('reports completion and clears the run', async () => {
		mocks.retrieve.mockResolvedValue({
			taskIdentifier: 'sync-account',
			tags: ['sync-user:user-1'],
			isCompleted: true,
			isSuccess: true
		});
		const { request, cookies } = event({ runId: 'run-1' });
		expect(await (await GET(request)).json()).toEqual({ status: 'completed' });
		expect(cookies.delete).toHaveBeenCalledWith('sync_run', { path: '/sync' });
	});

	it('reports failure and clears the run so it can be retried', async () => {
		mocks.retrieve.mockResolvedValue({
			id: 'run-1',
			taskIdentifier: 'sync-account',
			tags: ['sync-user:user-1'],
			isCompleted: true,
			isSuccess: false,
			status: 'FAILED'
		});
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { request, cookies } = event({ runId: 'run-1' });
		const response = await GET(request);
		expect(await response.json()).toMatchObject({ status: 'failed' });
		expect(cookies.delete).toHaveBeenCalledWith('sync_run', { path: '/sync' });
		log.mockRestore();
	});

	it('requests a new login when the provider token is missing', async () => {
		const { request, signOut } = event({ token: null });
		const response = await POST(request);
		expect(response.status).toBe(401);
		expect(signOut).toHaveBeenCalled();
		expect(mocks.trigger).not.toHaveBeenCalled();
	});
});
