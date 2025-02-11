import { Character } from "$lib/model";
import type { CharacterMedia, CharacterAsset } from '$lib/blizzard/wow/profile.js';
import { isAxiosError } from 'axios'
import { api } from '$lib/blizzard/api.js';

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
    let characters: Character[] = []
    let accounts = []
    try {
        let profile = (await api.profile(token));
        for (let account of profile.wow_accounts) {
            let cx = account.characters.map(async (c) => {
                let char = Character(c, account.id)
                try {
                    let extra = api.character.profile(c)
                    let media = api.character.media(c)
                    const [e, m] = await Promise.all([extra, media])
                    char.guild = e.guild?.name
                    char.spec = e.active_spec?.name
                    char.media = transformMedia(m)
                } catch (e) {
                    if (isAxiosError(e) && ![404].includes(e.status!!)) {
                        console.log(`Got ${e.status} for ${e.request.path}`)
                    }
                }
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