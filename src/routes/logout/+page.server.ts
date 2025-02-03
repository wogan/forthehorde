import { invalidateAll } from '$app/navigation'

export const load = ({ cookies }) => {
    // Ensure we aren't running this on link preload!
    // cookies.delete('token', { path: '/' })

    // this can't be called on the server
    // invalidateAll()
}