<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		news: News
	}

	// Types
	import type { News } from '$models/news.model'
	import type { Session } from '$models/session.model'
	// Components
	import ReadNews from '$components/News/ReadNews.svelte'

	// Init variables
	let news = data.news
</script>

<ReadNews {news} />
