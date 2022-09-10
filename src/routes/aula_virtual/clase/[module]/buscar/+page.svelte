<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Hits } from '$models/classroom/hits.model'
	import type { Session } from '$models/session.model'
	// Stores
	import { page } from '$app/stores'
	import { addToast } from '$stores/toasts'
	// Components
	import Search from '$components/HTML/Search.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import { formatDate } from '$utils/format'

	// Init variables
	let token = data.user.token
	let idModule = $page.params.module
	// Data
	let searchValue: string
	let works: Array<{
		_id: string
		title: string
		description: string
		date_start: string
		date_limit: string
		author: string
		published: string
	}> = []
	let publications: Array<{
		_id: string
		content: string
		author: string
		published: string
	}> = []

	async function search() {
		try {
			works = []
			publications = []
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/modules/search/${idModule}?search=${searchValue}`,
				true,
				token,
			)
			const hits = dataFetch.body.hits as Hits
			hits.hits.forEach((hit) => {
				if (hit._index === 'works') works = [...works, { ...hit._source, _id: hit._id }]
				if (hit._index === 'publications')
					publications = [...publications, { ...hit._source, _id: hit._id }]
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="Search">
	<Search bind:value={searchValue} {search} />
	<br />
	{#each works as work}
		<article class="Item">
			<a href="trabajos/{work._id}">
				<header>
					<h3>#Trabajo - {work.title}</h3>
				</header>
			</a>
			{#if work.description && work.description !== ''}
				<pre>{work.description}</pre>
			{/if}
			<span>Fecha apertura: {formatDate(work.date_start)}</span>
			<span>Fecha cierre: {formatDate(work.date_limit)}</span>
			<footer>
				<small>Publicado por: <span class="Mark">{work.author}</span></small>
				<small>{formatDate(work.published)}</small>
			</footer>
		</article>
	{/each}
	{#each publications as publication}
		<article class="Item">
			<a href="publicacion/{publication._id}">
				<header>
					<h3>#Publicaci&oacute;n</h3>
				</header>
			</a>
			<pre>{publication.content}</pre>
			<footer>
				<small>Publicado por <span class="Mark">{publication.author}</span></small>
				<small>{formatDate(publication.published)}</small>
			</footer>
		</article>
	{/each}
</section>

<style>
	.Search {
		margin: 20px;
		background-color: white;
		padding: 20px;
		border-radius: 15px;
		box-shadow: var(--box-shadow);
	}

	.Item {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 10px;
		box-sizing: border-box;
		border-bottom: 2px solid var(--color-light);
	}

	a {
		text-decoration: none;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	h3 {
		transition: all 0.4s;
	}

	.Item footer {
		margin-top: 15px;
		display: flex;
		justify-content: space-between;
	}

	.Mark {
		color: var(--color-main);
		font-weight: bold;
	}
</style>
