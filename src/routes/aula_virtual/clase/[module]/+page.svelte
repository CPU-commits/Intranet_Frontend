<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		section: string
	}

	// Types
	import { UserTypes } from '$models/users/user_type.model'
	import type { Publication as PublicationModel } from '$models/classroom/publication.model'
	import type { Session } from '$models/session.model'
	// Svelte
	import { afterUpdate, onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import Publication from '$components/Classroom/Publication.svelte'
	import PublicationWrite from '$components/Classroom/PublicationWrite.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'

	let token = data.user.token
	let section = data.section
	let moduleId = $page.params.module
	let user_type = data.user.user_type
	let user_name = data.user.name

	// Data
	let publications: Array<PublicationModel>
	let sectionStatic = section
	let running = false

	onMount(async () => {
		try {
			await replaceData(true)
		} catch (err) {
			running = false
			publications = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	afterUpdate(async () => {
		if (sectionStatic !== section) {
			try {
				sectionStatic = section
				publications = null
				await replaceData(true)
			} catch (err) {
				running = false
				addToast({
					message: err.message,
					type: 'error',
				})
			}
		}
	})

	async function replaceData(total = false, skip: number = 0, limit?: number) {
		running = true
		let query = `&skip=${skip}&total=${total}`
		if (limit) query += `&limit=${limit}`
		const dataFetch = await API.fetchGetData(
			`${variables.API_CLASSROOM_READ}/api/classroom/publications/get_publications/${moduleId}?section=${section}${query}`,
			false,
			token,
		)
		if (!publications) {
			publications = dataFetch.body.publications ? dataFetch.body.publications : []
		} else {
			publications = [...publications, ...dataFetch.body.publications]
		}
		running = false
		if (total)
			onscrollLoading(
				dataFetch.body.total,
				async (n: number) => {
					try {
						await replaceData(false, n + 1)
						return n + 20
					} catch (err) {
						running = false
						addToast({
							message: err.message,
							type: 'error',
						})
						return n
					}
				},
				20,
			)
	}
</script>

<section class="Publications">
	<section class="Publications__content">
		<div class="Publications__write">
			{#if user_type === UserTypes.TEACHER}
				<PublicationWrite
					bind:publications
					{user_name}
					{section}
					idModule={moduleId}
					{token}
				/>
			{/if}
		</div>
		{#if publications}
			{#each publications as publication}
				<Publication
					canEdit={user_type === UserTypes.TEACHER}
					{token}
					{moduleId}
					{publication}
				/>
			{:else}
				<div class="Empty">
					<img src="/img/empty.svg" alt="Contenido Vacío" />
					<span>Parece que est&aacute; todo vac&iacute;o por aqu&iacute;...</span>
				</div>
			{/each}
			{#if running}
				<SpinnerGet />
			{/if}
		{:else}
			<SpinnerGet />
		{/if}
	</section>
</section>

<style>
	.Publications {
		padding: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.Publications__content {
		width: 100%;
		max-width: 1000px;
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.Empty {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.Empty img {
		height: 300px;
		margin-bottom: 30px;
	}
</style>
