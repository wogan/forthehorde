import { BATTLE_NET_CLIENT_ID, BATTLE_NET_CLIENT_SECRET, VERCEL_PROJECT_PRODUCTION_URL } from '$env/static/private';
import { dev } from '$app/environment';

const scheme = dev ? 'http://' : 'https://'
const redirect_uri = `${scheme}${VERCEL_PROJECT_PRODUCTION_URL}/auth`

export interface Token {
    access_token: string
    token_type: "bearer"
    expires_in: number
    scope: string
    id_token?: string
}

export type Scope = 'openid' | 'wow.profile' | 'sc2.profile' | 'd3.profile'

export function redirectUrl(state: string, scopes: Scope[] = ['openid', 'wow.profile']): URL {
    const url = new URL('https://oauth.battle.net/authorize')
    url.searchParams.append('client_id', BATTLE_NET_CLIENT_ID)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', scopes.join(' '))
    url.searchParams.append('state', state)
    url.searchParams.append('redirect_uri', redirect_uri)
    return url
}

export async function authorize(code: string): Promise<Token> {
    return await token({ grant_type: 'authorization_code', code })
}

export async function accessToken(): Promise<Token> {
    return await token({ grant_type: 'client_credentials' })
}

export async function checkToken(token: string): Promise<boolean> {
    const body = new FormData
    body.append('token', token)
    const request = new Request('https://oauth.battle.net/oauth/check_token', { method: 'post', body })
    return (await fetch(request)).ok
}

interface ClientCredentials {
    grant_type: 'client_credentials'
}

interface AuthorizationCode {
    grant_type: 'authorization_code'
    code: string
}

async function token(method: ClientCredentials | AuthorizationCode): Promise<Token> {
    const body = new FormData;
    body.append('grant_type', method.grant_type)
    if (method.grant_type == 'authorization_code') {
        body.append('redirect_uri', redirect_uri)
        body.append('code', method.code)
    }
    const auth = btoa(`${BATTLE_NET_CLIENT_ID}:${BATTLE_NET_CLIENT_SECRET}`)
    const request = new Request('https://oauth.battle.net/token', {
        body, headers: {
            'Authorization': `Basic ${auth}`
        }, method: 'POST'
    })
    const response = await fetch(request)
    if (response.ok) {
        return (await response.json()) as Token
    }
    throw new Error('token request was unsuccessful')
}