<script lang="ts">
	import Rich from '$components/HTML/Rich.svelte'

	import type { News } from '$models/news.model'
	export let news: News
</script>

<section class="News">
	<div class="News__contain">
		<h1>{news.title}</h1>
		<p>{news.headline}</p>
		<img src={news.image.url} alt={news.title} />
		<Rich haveBackground={false} readOnly={true} body={news.body} />
	</div>
</section>

<style>
	.News {
		margin: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 400px;
	}

	.News__contain {
		max-width: 650px;
		width: 100%;
	}

	h1,
	p {
		width: 100%;
		padding-bottom: 10px;
	}

	img {
		width: 100%;
		max-height: 400px;
		object-fit: cover;
		cursor: pointer;
		margin-bottom: 30px;
	}

	h1 {
		font-weight: 900;
		font-size: 2rem;
		font-size: 'Karla', sans-serif;
		padding-top: 50px;
		color: var(--color-news-black);
	}

	p {
		font-size: 1rem;
		border-bottom: 2px solid #ebebeb;
		margin-bottom: 25px;
	}
</style>
