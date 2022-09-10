<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Panel from '$components/Admin/Panel.svelte'
	import AIcon from '$components/HTML/AIcon.svelte'
	import Table from '$components/HTML/Table.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	// Init variable
	let token = data.user.token
	// Data
	let years: Array<{ year: number }>

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/semesters/get_years`,
				true,
				token,
			)
			years = dataFetch.body.years
		} catch (err) {
			years = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<Panel nav={false}>
	<h2>Archivado</h2>
	{#if years}
		<Table header={['Año', 'Info.']}>
			{#each years as { year }}
				<tr>
					<td>{year}</td>
					<td><AIcon classItem={'fa-solid fa-info'} href={`archivado/${year}`} /> </td>
				</tr>
			{:else}
				<tr>
					<td>No hay años...</td>
				</tr>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>
