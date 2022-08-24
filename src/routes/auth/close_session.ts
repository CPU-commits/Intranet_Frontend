import * as cookie from 'cookie'

export async function post(event) {
    try {
        const cookiesData = event.request.headers.get('cookie')
        const cookies = cookie.parse(cookiesData || '')
        if(!cookies.token){
            return {
                status: 500,
                body: {
                    success: false,
                    message: 'No existe el token dentro de las cookies'
                }
            }
        }
        return {
            status: 200,
            headers: {
                'Set-Cookie': [
                    cookie.serialize('token', '', {
                        path: '/',
                        expires: new Date(0),
                    }),
                ],
            },
            body: {
                success: true,
            },
        }
    }catch(err){
        return {
            status: err.status,
            body: {
                success: false,
                message: err.message
            }
        }
    }
}
