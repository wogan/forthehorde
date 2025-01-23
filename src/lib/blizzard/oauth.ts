import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET, VERCEL_PROJECT_PRODUCTION_URL } from '$env/static/private';
import { dev } from '$app/environment';

const scheme = dev ? 'http://' : 'https://'
const redirect_uri = `${scheme}${VERCEL_PROJECT_PRODUCTION_URL}/auth`

export interface Token {
    access_token: string
    token_type: "bearer"
    expires_in: number
    scope: string
    id_token: string
}

export function redirectUrl(state: string): URL {
    let url = new URL('https://oauth.battle.net/authorize')
    url.searchParams.append('client_id', BATTLE_NET_CLIENT_ID)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', 'openid wow.profile')
    url.searchParams.append('state', state)
    url.searchParams.append('redirect_uri', redirect_uri)
    return url
}

export async function authorize(code: string): Promise<Token> {
    let body = new FormData;
    body.append('redirect_uri', redirect_uri)
    body.append('grant_type', 'authorization_code')
    body.append('code', code)
    let auth = btoa(`${BATTLE_NET_CLIENT_ID}:${BATTLE_NET_CLIENT_SECRET}`)
    let request = new Request('https://oauth.battle.net/token', {
        body, headers: {
            'Authorization': `Basic ${auth}`
        }, method: 'POST'
    })
    let response = await fetch(request)
    return (await response.json()) as Token
}