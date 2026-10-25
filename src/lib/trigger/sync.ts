import { logger, queue, task, wait } from '@trigger.dev/sdk';

export interface SyncAccountInput {
	token: string;
	account_id: number;
}

export interface SyncAccountOutput {
	message: string;
}

function validateInput(input: unknown): input is SyncAccountInput {
	return (
		typeof input === 'object' &&
		input !== null &&
		'token' in input &&
		typeof input.token === 'string' &&
		'account_id' in input &&
		typeof input.account_id === 'number'
	);
}

const syncQueue = queue({
	name: 'sync',
	concurrencyLimit: 1
});

export const syncAccount = task({
	id: 'sync-account',
	maxDuration: 300,
	queue: syncQueue,
	run: async (payload: SyncAccountInput): Promise<SyncAccountOutput> => {
		if (!validateInput(payload)) {
			throw Error('invalid input');
		}
		logger.log('START: sync-account', {
			account_id: payload.account_id
		});
		await wait.for({ seconds: 1 });
		logger.log('FINISH: sync-account', {
			account_id: payload.account_id
		});
		return {
			message: 'response'
		};
	}
});
