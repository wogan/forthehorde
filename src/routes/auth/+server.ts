import { redirect, type RequestHandler } from '@sveltejs/kit';
import { redirectUrl, authorize } from '$lib/blizzard/oauth';

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
    // get state from cookie?
    let params = url.searchParams
    if (params.has('code') && params.has('state')) {
        // let returnedState = params.get('state') ?? ''
        // todo validate state against cookie?
        let token = await authorize(params.get('code') ?? '')
        console.log(token)
        // Save to Database etc
        cookies.set('token', token.access_token, { httpOnly: false, path: '/' })
        return redirect(302, '/warband')
    }

    let state = '12345'
    // save state to cookie
    let auth_uri = redirectUrl(state)
    console.log('redirecting to', auth_uri)
    return Response.redirect(auth_uri.href)
}
