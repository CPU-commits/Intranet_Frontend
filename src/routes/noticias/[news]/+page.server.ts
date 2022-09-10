import { variables } from '$lib/variables'
import API from '$utils/APIModule'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ session, params }) {
    try {
        const news = await API.fetchGetData(
            `${variables.API_NEWS}/api/news/get_single_news/${params.news}`,
            false,
            session.user.token,
        )
        return {
            news: news.body.news,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
