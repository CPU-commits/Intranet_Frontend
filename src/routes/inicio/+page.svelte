<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	import { UserTypes } from '$models/users/user_type.model'
	import type { Annoucement } from '$models/home/annoucement.model'
	import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
	import type { News } from '$models/news.model'
	// Env
	import { env } from '$env/dynamic/public'
	// Svelte
	import { onMount } from 'svelte'
	// Components
	import WriteAnnoucement from '$components/Home/WriteAnnoucement.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import Error from '$components/Error.svelte'
	import AnnoucementC from '$components/Home/Annoucement.svelte'
	// Utils
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'
	import { browser } from '$app/environment'
	import { variables } from '$lib/variables'
	import { formatMiniDate } from '$utils/format'

	// Init variables
	let token = data.user.token
	let userName = data.user.name
	let userType = data.user.user_type

	// Data
	let promiseAnnoucements: Promise<void>
	let promiseNews: Promise<Array<News>> = getNews()
	let annoucements: Array<Annoucement> = []

	async function getAnnoucements(total = false, skip = 0, limit = 20) {
		let query = `?total=${total}&skip=${skip}&limit=${limit}`
		const dataFetch: FetchResponse<{ annoucements: Array<Annoucement>; total: number }> =
			await API.fetchGetData(
				`${env.PUBLIC_API}/api/annoucements/get_annoucements${query}`,
				false,
				token,
			)
		if (total)
			onscrollLoading(
				dataFetch.body.total,
				async (n: number) => {
					promiseAnnoucements = getAnnoucements(false, n)
					return n + 20
				},
				20,
			)
		if (dataFetch.body?.annoucements)
			annoucements = [...annoucements, ...dataFetch.body.annoucements]
	}

	async function getNews() {
		const dataFetch: FetchResponse<{ news: Array<News> }> = await API.fetchGetData(
			`${variables.API_NEWS}/api/news/get_news?limit=5`,
			false,
			token,
		)
		return dataFetch.body.news
	}

	onMount(() => {
		promiseAnnoucements = getAnnoucements(true)
	})
</script>

<section class="Home">
	<aside class="Home__last">
		{#await promiseNews}
			<SpinnerGet />
		{:then news}
			{#each news as news}
				<a href="/noticias/{news.url}">
					<article class="News">
						<header>
							<h2>{news.title}</h2>
							<img src={news.image.url} alt={news.title} />
						</header>
						<footer>
							<small>
								Publicado por:
								<span class="News__author">
									{#if news.author?.name}
										{news.author.name}
										{news.author.first_lastname}
									{:else}
										<i class="fa-solid fa-robot" /> Noticia autom&aacute;tica
									{/if}
								</span>
							</small>
							<small>{formatMiniDate(news.upload_date)}</small>
						</footer>
					</article>
				</a>
			{/each}
		{:catch err}
			<Error {err} />
		{/await}
	</aside>
	<section class="Home__annoucements">
		{#if userType === UserTypes.DIRECTIVE || userType === UserTypes.DIRECTOR}
			<WriteAnnoucement bind:annoucements {token} {userName} />
		{/if}
		<div class="Home__annoucements--content">
			{#each annoucements as annoucement}
				<AnnoucementC user_type={userType} {annoucement} {token} />
			{/each}
		</div>
		{#if browser}
			{#await promiseAnnoucements}
				<SpinnerGet />
			{:catch err}
				<Error {err} />
			{/await}
		{/if}
	</section>
</section>

<style>
	a {
		text-decoration: none;
	}

	a:hover h2 {
		color: var(--color-main);
	}

	.News {
		background-color: white;
		box-shadow: var(--box-shadow);
		padding: 10px;
		border-radius: 8px;
		box-sizing: border-box;
	}

	.News h2 {
		font-size: 1.1rem;
		text-align: center;
		transition: all 0.4s;
	}

	.News img {
		width: 100%;
	}

	.News footer {
		display: flex;
		flex-direction: column;
	}

	.News__author,
	.News__author i {
		color: var(--color-main);
		font-weight: bold;
	}

	.Home {
		margin: 30px;
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 20px;
	}

	.Home__annoucements {
		background-color: white;
		box-shadow: var(--box-shadow);
		border-radius: 15px;
		padding: 15px;
	}

	.Home__annoucements--content {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
