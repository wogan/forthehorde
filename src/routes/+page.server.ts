
interface UserInfo {
    sub: string
    id: number
    battletag: string
}

function username(battletag: string): string {
    return battletag.split('#')[0]
}

async function checkToken(token: string): Promise<boolean> {
    const url = new URL('https://oauth.battle.net/oauth/check_token')
    const body = new FormData
    body.append('token', token)
    const request = new Request(url, { method: 'post', body })
    return (await fetch(request)).ok
}

export const load = async ({ cookies, fetch }) => {
    let token = cookies.get('token')
    if (!token) {
        return {};
    }
    const check = await checkToken(token)
    if (!check) {
        cookies.delete('token', { path: '/' })
        return {}
    }
    const userinfo = new URL('https://oauth.battle.net/userinfo')
    userinfo.searchParams.append('access_token', token) // couldn't get the auth header to work
    let request = new Request(userinfo, {
        headers: {
            'Authorization': `Bearer ${token}`
        }, method: 'GET'
    })
    let response = await fetch(userinfo)
    if (!response.ok) {
        return {}
    }
    let data = await response.json() as UserInfo
    return {
        username: username(data.battletag)
    }
}