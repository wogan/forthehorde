import { logger, task, wait } from "@trigger.dev/sdk/v3";

export interface SyncAccountInput {
    token: string
    account_id: number
}

export interface SyncAccountOutput {
    message: string
}

function validateInput(input: any): input is SyncAccountInput {
    return typeof input === 'object'
        && typeof input['token'] === 'string'
        && typeof input['account_id'] === 'number'
}

export const syncAccount = task({
    id: 'sync-account',
    maxDuration: 300,
    queue: {
        concurrencyLimit: 1,
    },
    run: async (payload: SyncAccountInput, { ctx }): Promise<SyncAccountOutput> => {
        if (!validateInput(payload)) {
            throw Error('invalid input')
        }
        logger.log('START: sync-account', {
            account_id: payload.account_id
        })
        await wait.for({ seconds: 1 })
        logger.log('FINISH: sync-account', {
            account_id: payload.account_id
        })
        return {
            message: 'response'
        }
    }
})