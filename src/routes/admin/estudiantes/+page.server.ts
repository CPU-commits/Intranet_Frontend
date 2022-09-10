import { variables } from "$lib/variables"
import API from "$utils/APIModule"
import { error } from "@sveltejs/kit"

export async function load({ session }) {
    try {
        const dataFetch = await API.fetchGetData(
            `${variables.API}/api/students/get_voting_status`,
            false,
            session.user.token,
        )
        return {
            status: dataFetch.body.status,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
