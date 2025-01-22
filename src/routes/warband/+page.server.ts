import { wow } from 'blizzard.js'
import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET } from '$env/static/private';
import { Character } from "$lib/model";

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
    });
    let profile = (await wowClient.accountProfile({ token }));
    let characters: Character[] = []
    for (let account of profile.data.wow_accounts) {
        let cx = account.characters.map(c => ({
            name: c.name
        }))
        characters.push(...cx)
    }
    return {
        characters
    }

}