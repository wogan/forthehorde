import { redirect, type RequestHandler } from '@sveltejs/kit';
import { redirectUrl, authorize } from '$lib/blizzard/oauth';

let state = '12345'

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
    // get state from cookie?
    let params = url.searchParams
    if (params.has('code') && params.has('state')) {
        // todo validate state against cookie?
        let token = await authorize(state, params.get('code') ?? '')
        // Save to Database etc
        cookies.set('token', token.access_token, { httpOnly: false, path: '/' });
        return redirect(302, '/warband');
    }

    let auth_uri = redirectUrl(state)
    return Response.redirect(auth_uri);
}
