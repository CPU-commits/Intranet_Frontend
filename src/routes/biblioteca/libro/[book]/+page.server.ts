import { variables } from "$lib/variables"
import API from "$utils/APIModule"
import { error } from "@sveltejs/kit"

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, params }) {
    try {
        const session = await parent()
        const dataFetch = await API.fetchGetData(
            `${variables.API_LIBRARY}/api/books/get_book/${params.book}`,
            false,
            session.user.token,
        )
        return {
            book: dataFetch.body.book,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
