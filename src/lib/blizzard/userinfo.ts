export interface UserInfo {
    sub: string
    id: number
    battletag: string
}

export async function userinfo(token: string): Promise<UserInfo> {
    let request = new Request('https://oauth.battle.net/userinfo', {
        headers: {
            'Authorization': `Bearer ${token}`
        }, method: 'GET'
    })
    let response = await fetch(request)
    if (!response.ok) {
        throw new Error('Unable to load user info')
    }
    return await response.json() as UserInfo
}
