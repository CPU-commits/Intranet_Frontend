<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import ClassroomMenu from '$components/Classroom/ClassroomMenu.svelte'
	import Module from '$components/Classroom/Module.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import { page } from '$app/stores'

	// Init variables
	let token = data.user.token
	$: pathname = $page.url.pathname
	let user_type = data.user.user_type

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
	<ClassroomMenu {user_type} {token} {pathname} />
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

	.Classroom__modules {
		padding: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 220px);
		gap: 15px;
	}
</style>
