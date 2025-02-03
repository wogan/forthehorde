// Data returned from layout load functions is available to child +layout.svelte components
// and the +page.svelte component as well as the layout that it ‘belongs’ to.
import { checkToken } from "$lib/blizzard/oauth"
import { userinfo } from "$lib/blizzard/userinfo.js"

function username(battletag: string): string {
    return battletag.split('#')[0]
}

export const load = async ({ cookies }) => {
    let token = cookies.get('token')
    if (!token) {
        return {};
    }
    const check = await checkToken(token)
    if (!check) {
        cookies.delete('token', { path: '/' })
        return {}
    }
    try {
        const data = await userinfo(token)
        return {
            username: username(data.battletag)
        }
    } catch (e) {
        console.log(e)
        return {}
    }
}