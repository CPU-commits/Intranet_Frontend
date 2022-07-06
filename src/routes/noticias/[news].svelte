<script lang="ts" context="module">
	import { variables } from '$lib/variables'
	import type { News } from '$models/news.model'

	import API from '$utils/APIModule'

	export async function load({ session, params }) {
		try {
			const news = await API.fetchGetData(
				`${variables.API_NEWS}/api/news/get_single_news/${params.news}`,
				false,
				session.user.token,
			)
			return {
				status: 200,
				props: {
					news: news.body.news,
				},
			}
		} catch (err) {
			return {
				status: err.statusCode,
				error: err.message,
			}
		}
	}
</script>

<script lang="ts">
	import ReadNews from '$components/News/ReadNews.svelte'

	export let news: News
</script>

<ReadNews {news} />
