import * as cookie from 'cookie'
import stringHash from 'string-hash'

import { variables } from '$lib/variables'
import redisInstance from './redisInstance'

export default async function setCookie(data){
    // Desencrypt
    try {
        const id = stringHash(data.access_token).toString()
        await (await redisInstance).set(id, JSON.stringify({
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
                    maxAge: (3600 * 5),
                }),
        }
        return headers
    }catch(err){
        throw new Error(err)
    }
}
