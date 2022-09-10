<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Work } from '$models/classroom/work.model'
	import type { Session } from '$models/session.model'
	import { UserTypes } from '$models/users/user_type.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import WorkCard from '$components/Classroom/Works/WorkCard.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	// Init variables
	let token = data.user.token
	let idModule = $page.params.module
	let user_type = data.user.user_type
	// Data
	let works: Array<Work>

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/works/get_works/${idModule}`,
				false,
				token,
			)
			works = dataFetch.body.works ? dataFetch.body.works : []
		} catch (err) {
			works = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<section class="Works">
	<h2>Trabajos</h2>
	{#if user_type === UserTypes.TEACHER}
		<a href="trabajos/nuevo_trabajo" sveltekit:prefetch>
			<i class="fa-solid fa-plus" /> Nuevo trabajo
		</a>
	{/if}
	{#if works}
		{#each works as work}
			<WorkCard {token} {user_type} {work} />
		{:else}
			<figure class="NoWorks">
				<img src="/img/no_works.svg" alt="Sin trabajos" />
				<figcaption>Sin trabajos a la vista...</figcaption>
			</figure>
		{/each}
	{:else}
		<SpinnerGet />
	{/if}
</section>

<style>
	.Works {
		background-color: white;
		margin: 20px;
		padding: 15px;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
	}

	.NoWorks {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.NoWorks img {
		height: 300px;
		width: 100%;
		margin-bottom: 30px;
	}

	i,
	a {
		color: var(--color-main);
	}
</style>
