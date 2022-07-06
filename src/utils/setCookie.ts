import * as cookie from 'cookie'
import stringHash from 'string-hash'

import { variables } from '$lib/variables'
import redisInstance from './redisInstance'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function setCookie(data: any){
    // Desencrypt
    try {
        const id = stringHash(data.access_token).toString()
        const redis = await redisInstance()
        await redis.set(id, JSON.stringify({
            ...data.user,
            token: data.access_token,
        }))
        const headers = {
            'Set-Cookie':
                cookie.serialize('token', id, {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: (variables.NODE_ENV === 'prod'),
                }),
        }
        return headers
    }catch(err){
        throw new Error(err)
    }
}
