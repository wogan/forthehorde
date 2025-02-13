import { Character } from "$lib/model";
import { isAxiosError } from 'axios'
import { api } from '$lib/blizzard/api.js';
import type { CharacterAsset, CharacterMedia } from "$lib/blizzard/wow/profile";

function transformMedia(media: CharacterMedia): Awaited<Character['media']> {
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
        await api.checkAuth()
        let profile = (await api.profile(token));
        for (let account of profile.wow_accounts) {
            let cx = account.characters.map(c => Character(
                c,
                account.id,
                api.character.profile(c).then(p => ({ guild: p.guild?.name, spec: p.active_spec?.name })).catch(e => ({})),
                api.character.media(c).then(transformMedia).catch(e => ({ main: '', inset: '', avatar: '' })) // todo construct default urls
            ))
            characters.push(...cx)
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