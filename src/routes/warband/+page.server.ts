import { wow } from 'blizzard.js'
import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET } from '$env/static/private';
import { Character } from "$lib/model";
import type { Profile, Character as BlizzardCharacter, CharacterProfile } from '$lib/blizzard/wow/profile.js';
import { isAxiosError } from 'axios'

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
                    let extra = await wowClient.characterProfile<CharacterProfile>({
                        name: c.name.toLowerCase(),
                        realm: c.realm.slug,
                        locale: 'en_US'
                    })
                    char.guild = extra.data.guild?.name
                    char.spec = extra.data.active_spec?.name
                } catch (e) {
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