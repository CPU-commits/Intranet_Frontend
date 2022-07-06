import * as cookie from 'cookie'

import redisInstance from '$utils/redisInstance'

export async function handle({ event, resolve }){
    event.locals.user = await event.request.headers.get('cookie')
    const response = await resolve(event)
    return response
}

export async function getSession(event){
    // Get cookies
    const cookies = cookie.parse(event.locals.user || '')
    if(!cookies.token) {
        return {
            authenticated: false,
        }
    }
    // Get session
    try {
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
        return {
            authenticated: false,
        }
    }
}
