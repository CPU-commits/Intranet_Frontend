import { variables } from '$lib/variables'
import type { Session } from '$models/session.model'
import API from '$utils/APIModule'
import { error } from '@sveltejs/kit'

export async function load({ parent, params }) {
    const session: Session = await parent()
    try {
        const dataFetch = await API.fetchGetData(
            `${variables.API_LIBRARY}/api/authors/get_author/${params.author}`,
            false,
            session.user.token,
        )
        return {
            author: dataFetch.body.author,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
