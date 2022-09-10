import { variables } from '$lib/variables'
import API from '$utils/APIModule'
import { error } from '@sveltejs/kit'

export async function load({ session, params }) {
    try {
        const dataFetch = await API.fetchGetData(
            `${variables.API_CLASSROOM_READ}/api/classroom/publications/get_publication/${params.module}/${params.publication}`,
            true,
            session.user.token,
        )
        return {
            publication: dataFetch.body.publication,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
