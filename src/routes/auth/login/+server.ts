import { variables } from '$lib/variables'
import setCookie from '$utils/setCookie'
import API from '$utils/APIModule'
import { json } from '@sveltejs/kit'

const APIUrl = variables.API

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try{
        const body = await request.json()
        const registerUser = await API.fetchData(
            'post',
            `${APIUrl}/api/authentication`,
            body,
        )
        const headers = await setCookie(registerUser)
        return json(
            {
                success: true,
            },
            { headers },
        )
    }catch(err){
        return json(
            {
                success: false,
                message: err.message,
            },
            { status: err.status },
        )
    }
}
