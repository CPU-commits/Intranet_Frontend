<script context="module">
	export function load({ session }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
			},
		}
	}
</script>

<script lang="ts">
	import Panel from '$components/Admin/Panel.svelte'
	import AIcon from '$components/HTML/AIcon.svelte'
	import Table from '$components/HTML/Table.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	export let token: string

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
