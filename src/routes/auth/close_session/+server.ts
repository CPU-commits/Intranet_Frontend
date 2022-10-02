import { json } from '@sveltejs/kit'
import * as cookie from 'cookie'

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const cookiesData = request.headers.get('cookie')
        const cookies = cookie.parse(cookiesData || '')
        if(!cookies.token){
            return json(
                {
                    success: false,
                    message: 'No existe el token dentro de las cookies',
                },
                {
                    status: 500,
                },
            )
        }
        return json(
            {
                success: true,
            },
            {
                headers: {
                    'Set-Cookie':
                        cookie.serialize('token', '', {
                        path: '/',
                        expires: new Date(0),
                    }),
                },
            },
        )
    }catch(err){
        return json(
            {
                success: false,
                message: err.message
            },
            {
                status: err.status,
            },
        )
    }
}
