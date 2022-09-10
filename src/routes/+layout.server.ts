import { redirect } from '@sveltejs/kit'

import redisInstance from '$utils/redisInstance'
import cookie from 'cookie'

const PUBLICURLS = ['/', 'favicon.ico']

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ request, url }) {
    // Get cookies
    try {
        const cookies = cookie.parse(request.headers.get('cookie') || '')
        if(!cookies.token) {
            throw new Error('Not cookie')
        }
        // Get session
        const redis = await redisInstance()
        const session = await redis.get(cookies.token)
        if (!session)
            throw new Error('Invalid session')
        // Return data
        return {
            authenticated: true,
            token: cookies.token,
            user: JSON.parse(session),
        }
    } catch(err) {
        if (!PUBLICURLS.some((u) => u === url.pathname))
            throw redirect(307, `/?redirect=${url.pathname}`)
        return {
            authenticated: false,
        }
    }
}
