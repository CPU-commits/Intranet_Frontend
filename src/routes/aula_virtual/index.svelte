<script lang="ts" context="module">
	export function load({ url, session }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
				user_type: session.user.user_type,
			},
		}
	}
</script>

<script lang="ts">
	import Module from '$components/Classroom/Module.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { ClassroomModules } from '$models/classroom/modules'

	import { addToast } from '$stores/toasts'

	import API from '$utils/APIModule'

	import { onMount } from 'svelte'

	export let token: string
	export let user_type: string

	let modules: ClassroomModules[]

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/modules/get_modules`,
				false,
				token,
			)
			modules = dataFetch.body.modules ? dataFetch.body.modules : []
		} catch (err) {
			modules = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<section class="Classroom">
	<nav class="Classroom__menu">
		<a sveltekit:prefetch href="/aula_virtual">
			<i class="fa-solid fa-chalkboard" />
		</a>
		<a sveltekit:prefetch href="/aula_virtual/calendario">
			<i class="fa-solid fa-calendar-days" />
		</a>
		<a sveltekit:prefetch href="/aula_virtual/tarea">
			<i class="fa-solid fa-thumbtack" />
		</a>
		<a sveltekit:prefetch href="/aula_virtual/">
			<i class="fa-solid fa-marker" />
		</a>
	</nav>
	<section class="Classroom__modules">
		{#if modules}
			{#each modules as moduleData}
				<Module {moduleData} {user_type} />
			{:else}
				<span>Sin m&oacute;dulos...</span>
			{/each}
		{:else}
			<SpinnerGet />
		{/if}
	</section>
</section>

<style>
	.Classroom {
		padding: 20px;
	}

	.Classroom__menu {
		padding: 10px;
		display: flex;
		width: 100%;
		justify-content: space-around;
		box-sizing: border-box;
		border: 2px solid var(--color-main);
	}

	.Classroom__modules {
		padding: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 220px);
		gap: 15px;
	}
</style>
