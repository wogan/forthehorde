
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
        console.log('no cookie', token)
        return {};
    }
    const check = await checkToken(token)
    if (!check) {
        return {}
    }
    const userinfo = new URL('https://oauth.battle.net/userinfo')
    userinfo.searchParams.append('access_token', token)
    let request = new Request(userinfo, {
        headers: {
            'authorization': `Bearer ${token}`
        }, method: 'GET'
    })
    let response = await fetch(userinfo)
    if (!response.ok) {
        console.log(response.status)
        return {}
    }
    let data = await response.json() as UserInfo
    return {
        username: username(data.battletag)
    }
}