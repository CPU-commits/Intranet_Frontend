<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { News } from '$models/news.model'
	import type { Session } from '$models/session.model'
	import { UserTypes } from '$models/users/user_type.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import NewsComponent from '$components/News/News.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'

	// Init variables
	let token = data.user.token
	let user_type = data.user.user_type
	//News
	const LIMIT = 10
	let news: News[]

	onMount(async () => {
		try {
			const newsData = await getNews(true)
			if (newsData.body.total > 0) {
				news = newsData.body.news
			} else {
				news = []
			}
			onscrollLoading(
				newsData.body.total,
				async (n: number) => {
					try {
						const dataFetch = await getNews(false, n)
						news = [...news, ...dataFetch.body.news]
						return n + LIMIT
					} catch (err) {
						if (news.length === 0) news = []
						addToast({
							message: err.message,
							type: 'error',
						})
						return n
					}
				},
				LIMIT,
			)
		} catch (err) {
			news = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getNews(total = false, skip?: number) {
		let URL = `${variables.API_NEWS}/api/news/get_news?total=${total}&limit=${LIMIT}&type=student`
		if (skip) URL += `&skip=${skip}`
		const data = await API.fetchGetData(URL, false, token)
		return data
	}
</script>

<section class="News">
	{#if user_type === UserTypes.STUDENT || user_type === UserTypes.STUDENT_DIRECTIVE}
		<ul class="News__type">
			<li><a data-sveltekit-prefetch href="/noticias">General</a></li>
			<li>
				<a class="News__type--use" data-sveltekit-prefetch href="/noticias/estudiantes"
					>Estudiantes</a
				>
			</li>
		</ul>
	{/if}
	{#if news}
		{#each news as newsData}
			<NewsComponent type={'global'} {user_type} {token} news={newsData} />
		{:else}
			<h3>Sin noticias...</h3>
		{/each}
	{:else}
		<SpinnerGet />
	{/if}
</section>

{#if user_type === UserTypes.DIRECTIVE || user_type === UserTypes.DIRECTOR || user_type === UserTypes.STUDENT_DIRECTIVE}
	<button>
		<a href="/noticias/publicar">
			<aside class="AddNews">
				<i class="fa-solid fa-plus" />
			</aside>
		</a>
	</button>
{/if}

<style lang="scss">
	.News {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 30px;
		box-sizing: border-box;
		gap: 40px;
	}

	.News__type {
		display: flex;
		gap: 20px;
		list-style: none;
	}

	.News__type a {
		text-decoration: none;
		font-size: 0.9rem;
		transition: all 0.4s;
	}

	.News__type a:hover {
		color: var(--color-news);
	}

	.News__type--use {
		color: var(--color-news);
	}

	.AddNews {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background-color: var(--color-news);
		height: 50px;
		width: 50px;
		border-radius: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		i {
			color: var(--color-news--black);
		}
	}
</style>
