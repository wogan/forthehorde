import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET, VERCEL_PROJECT_PRODUCTION_URL } from '$env/static/private';
import { dev } from '$app/environment';

let state = '12345'
let scheme = dev ? 'http://' : 'https://'
let redirect_uri = `${scheme}${VERCEL_PROJECT_PRODUCTION_URL}/auth` // todo read from env?

export class Token {
    access_token!: string
    token_type!: "bearer"
    expires_in!: number
    scope!: string
}

export function redirectUrl(state: string): URL {
    let auth_uri = `https://oauth.battle.net/authorize?client_id=${BATTLE_NET_CLIENT_ID}&response_type=code&scope=openid wow.profile&state=${state}&redirect_uri=${redirect_uri}`
    return new URL(auth_uri)
}

export async function authorize(state: string, code: string): Promise<Token> {
    let body = new FormData;
    body.append('redirect_uri', redirectUrl(state).href);
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