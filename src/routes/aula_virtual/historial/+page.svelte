<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	import type { ClassroomModules } from '$models/classroom/modules'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import ClassroomMenu from '$components/Classroom/ClassroomMenu.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import Module from '$components/Classroom/Module.svelte'
	import onscrollLoading from '$utils/onscrollLoading'

	// Init variables
	let token = data.user.token
	let user_type = data.user.user_type
	$: pathname = $page.url.pathname
	// Data
	let modules: Array<ClassroomModules>

	onMount(async () => {
		try {
			const dataFetch = await getModules(true)
			modules = dataFetch.body.modules ?? []
			// Onscroll
			onscrollLoading(
				dataFetch.body.total,
				async (n: number) => {
					try {
						const dataFetch = await getModules(false, 20, n)
						modules = [...modules, ...(dataFetch.body.moodules ?? [])]
						return n + 20
					} catch (err) {
						addToast({
							message: err.message,
							type: 'error',
						})
					}
				},
				20,
			)
		} catch (err) {
			modules = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getModules(total: boolean = false, limit: number = 20, skip: number = 0) {
		const query = `?total=${total}&limit=${limit}&skip=${skip}`
		return await API.fetchGetData(
			`${variables.API_CLASSROOM_READ}/api/classroom/modules/get_modules_history${query}`,
			false,
			token,
		)
	}
</script>

<section class="Classroom">
	<ClassroomMenu {pathname} {user_type} {token} />
	<section class="Classroom__modules">
		{#if modules}
			{#each modules as _module}
				<Module isHistory={true} {user_type} moduleData={_module} />
			{:else}
				<span>Sin m&oacute;dulos en historial</span>
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

	.Classroom__modules {
		padding: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 220px);
		gap: 15px;
	}
</style>
