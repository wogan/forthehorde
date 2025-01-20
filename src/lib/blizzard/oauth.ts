
export class Token {
    access_token!: string
    token_type!: "bearer"
    expires_in!: number
    scope!: string
}


export function redirectUrl(state: string): URL {

    
    return new URL(`https://oauth.battle.net/authorize?response_type=code&scope=openid&scope=wow.profile&state=${state}&redirect_uri=`)
}