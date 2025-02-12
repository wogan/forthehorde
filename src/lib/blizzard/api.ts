import { wow } from 'blizzard.js'
import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET } from '$env/static/private'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import type { Character, CharacterMedia, CharacterProfile, Profile } from './wow/profile'
import type { ResourceResponse } from 'blizzard.js/dist/resources'
import pRetry from 'p-retry'
import { isAxiosError } from 'axios'
import type { WoW } from 'blizzard.js/dist/wow/client'
import type { Title, TitleIndex } from './wow/title'

const limiter = new RateLimiterMemory({
    points: 100,
    duration: 1
})

const wowClient = await wow.createInstance({
    key: BATTLE_NET_CLIENT_ID,
    secret: BATTLE_NET_CLIENT_SECRET,
    origin: 'us',
    locale: 'en_US',
}, false)

async function run<T>(request: () => ResourceResponse<T>): Promise<T> {
    return await pRetry(async () => {
        await limiter.consume('key', 1)
        const response = await (request())
        return response.data
    }, {
        retries: 3,
        onFailedAttempt: async (e) => {
            if (isAxiosError(e) && e.status === 401) {
                await wowClient.refreshApplicationToken()
            }
        },
        shouldRetry: e => isAxiosError(e) && [401, 429].includes(e.status!!)
    })
}

async function checkAuth() {
    try {
        const currentToken = (wowClient as WoW).defaults.token
        if (typeof currentToken === 'undefined') {
            await wowClient.refreshApplicationToken()
        } else {
            await wowClient.validateApplicationToken()
        }
    } catch (e) {
        if (isAxiosError(e) && e.status === 401) {
            await wowClient.refreshApplicationToken();
        }
    }
}

const profile = async (token: string): Promise<Profile> => {
    return run(() => wowClient.accountProfile<Profile>({ token }))
}

const characterProfile = async (char: Character): Promise<CharacterProfile> => {
    return run(() => wowClient.characterProfile<CharacterProfile>({
        name: char.name.toLowerCase(),
        realm: char.realm.slug,
    }))
}

const characterMedia = async (char: Character): Promise<CharacterMedia> => {
    return run(() => wowClient.characterMedia<CharacterMedia>({
        name: char.name.toLowerCase(),
        realm: char.realm.slug,
    }))
}

export const api = {
    checkAuth,
    profile,
    character: {
        profile: characterProfile,
        media: characterMedia
    },
    titles: {
        index: () => run(() => wowClient.title<TitleIndex>()),
        title: (id: number) => run(() => wowClient.title<Title>({ id }))
    }
} as const
