<script lang="ts">
	// Exports
	export let news: News

	// Types
	import type { News } from '$models/news.model'
	// Components
	import Rich from '$components/HTML/Rich.svelte'
</script>

<section class="News">
	<div class="News__contain">
		<header>
			<h1>{news.title}</h1>
			<p>{news.headline}</p>
			<span class="News__container--author">
				{#if news.author?.name}
					{news.author.name} {news.author.first_lastname}
				{:else}
					<i class="fa-solid fa-robot" /> Noticia autom&aacute;tica
				{/if}
			</span>
		</header>
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
		margin-bottom: 30px;
	}

	.News__contain header {
		margin-bottom: 15px;
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

	.News__container--author,
	.News__container--author i {
		color: var(--color-main);
		font-weight: bold;
	}
</style>
