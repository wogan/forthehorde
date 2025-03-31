import { redirect } from '@sveltejs/kit';
import { redirectUrl, authorize } from '$lib/blizzard/oauth';
import { randomString } from '$lib/random';

export const load = async ({ url: { searchParams: params }, cookies }) => {
    // TODO we can also get redirected back here if the user cancels the flow - how to handle?
    if (params.has('code') && params.has('state')) {
        let state = cookies.get('oauthstate') ?? ''
        let returnedState = params.get('state') ?? ''
        if (state == '' || state !== returnedState) {
            console.warn('Missing or invalid state on login attempt.')
            return {
                error: 'State parameter missing or invalid'
            }
        }
        let token = await authorize(params.get('code') ?? '')
        let expires = new Date()
        expires.setSeconds(expires.getSeconds() + token.expires_in)
        cookies.set('token', token.access_token, { httpOnly: false, path: '/', expires })
        cookies.set('id_token', token.id_token ?? '', { httpOnly: false, path: '/', expires })

        cookies.delete('oauthstate', { path: '/auth' })
        return redirect(302, '/warband')
    }
    let state = randomString()
    cookies.set('oauthstate', state, { path: '/auth', httpOnly: true })
    return redirect(302, redirectUrl(state))
}
