import { variables } from '$lib/variables'
import setCookie from '$utils/setCookie'
import API from '$utils/APIModule'

const APIUrl = variables.API

export async function post({ request }) {
    try{
        const body = await request.json()
        const registerUser = await API.fetchData(
            'post',
            `${APIUrl}/api/authentication`,
            body,
        )
        const headers = await setCookie(registerUser)
        return {
            status: 200,
            headers,
            body: {
                success: true,
            }
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
