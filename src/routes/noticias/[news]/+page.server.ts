import { variables } from '$lib/variables'
import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
import type { News } from '$models/news.model'
import type { Session } from '$models/session.model'
import API from '$utils/APIModule'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, params }) {
    try {
        const session: Session = await parent()
        const dataFetch: FetchResponse<{ news: News }> = await API.fetchGetData(
            `${variables.API_NEWS}/api/news/get_single_news/${params.news}`,
            false,
            session.user.token,
        )
        return {
            news: dataFetch.body.news,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
