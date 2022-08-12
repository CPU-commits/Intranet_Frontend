<script context="module">
	export function load({ session, params }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
				user_type: session.user.user_type,
				idModule: params.module,
			},
		}
	}
</script>

<script lang="ts">
	import WorkCard from '$components/Classroom/Works/WorkCard.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { Work } from '$models/classroom/work.model'

	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'

	import { onMount } from 'svelte'

	export let token: string
	export let idModule: string
	export let user_type: string

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
