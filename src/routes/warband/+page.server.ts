import { wow } from 'blizzard.js'
import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET } from '$env/static/private';
import { Character } from "$lib/model";
import type { Profile, Character as BlizzardCharacter, CharacterProfile, CharacterMedia, CharacterAsset } from '$lib/blizzard/wow/profile.js';
import { AxiosError, isAxiosError } from 'axios'
import { sleep } from '$lib';

function transformMedia(media: CharacterMedia): Character['media'] {
    const f = (s: CharacterAsset) => media.assets.find(a => a.key === s)?.value!!
    return {
        main: f('main-raw'),
        avatar: f('avatar'),
        inset: f('inset')
    }
}

export const load = async ({ cookies }) => {
    let token = cookies.get('token');
    if (typeof token == 'undefined') {
        return {
            characters: [] as Character[]
        };
    }
    const wowClient = await wow.createInstance({
        key: BATTLE_NET_CLIENT_ID,
        secret: BATTLE_NET_CLIENT_SECRET,
        origin: 'us',
        locale: 'en_US',
        token,
    }, false);
    let characters: Character[] = []
    let accounts = []
    try {
        let profile = (await wowClient.accountProfile<Profile>({ token }));
        for (let account of profile.data.wow_accounts) {
            let cx = account.characters.map(async (c: BlizzardCharacter) => {
                let char = Character(c, account.id)
                try {
                    let extra = wowClient.characterProfile<CharacterProfile>({
                        name: c.name.toLowerCase(),
                        realm: c.realm.slug,
                        locale: 'en_US'
                    })
                    let media = wowClient.characterMedia<CharacterMedia>({
                        name: c.name.toLowerCase(),
                        realm: c.realm.slug,
                        locale: 'en_US'
                    })
                    const [e, m] = await Promise.all([extra, media])
                    char.guild = e.data.guild?.name
                    char.spec = e.data.active_spec?.name
                    char.media = transformMedia(m.data)
                } catch (e) {
                    if (isAxiosError(e) && ![404, 429].includes(e.status!!)) {
                        console.log(`Got ${e.status} for ${e.request.path}`)
                    }
                }
                await (sleep(1000)) // TODO we need to do these API calls offline!
                return char
            })
            let values = await Promise.all(cx)
            characters.push(...values)
            accounts.push({
                id: account.id
            })
        }
    } catch (e) {
        if (isAxiosError(e)) {
            console.log('Unable to load profile details', e.message)
        }
    }
    return {
        characters,
        accounts
    }

}