<script lang="ts" context="module">
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
	export let token: string

	import Icons from '$components/Admin/Icons.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Search from '$components/HTML/Search.svelte'
	import Table from '$components/HTML/Table.svelte'
	import { variables } from '$lib/variables'
	import type { Directives } from '$models/admin/Directive.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	//Search
	let search = ''
	const LIMIT = 30
	// Data
	let directives: Directives

	onMount(async () => {
		try {
			const data = await getDirectives(true, 0)
			directives = data.body
			console.log(directives)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getDirectives(total = false, skip?: number, search?: string) {
		let URL = `${variables.API}/api/directive/get_directives?total=${total}&limit=${LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip >= 0) URL += `&skip=${skip}`
		const data = await API.fetchGetData(URL, true, token)
		return data
	}
</script>

<Panel>
	<Icons slot="nav">
		<ButtonIcon classItem={'fa-solid fa-user-plus'} />
		<ButtonIcon classItem={'fa-solid fa-user-group'} />
	</Icons>
	<h2>Directivos</h2>
	<Search bind:value={search} />
	{#if directives}
		<br />
		<Table header={['Nombre', 'Ap. P', 'Ap. M', 'RUT', 'Estado', '']}>
			{#each directives.users as directive}
				<tr>
					<td>{directive.name}</td>
					<td>{directive.first_lastname}</td>
					<td>{directive.second_lastname}</td>
					<td>{directive.rut}</td>
					<td>{directive.status ? 'Activo' : 'Inactivo'}</td>
					<td>
						<Button type={'button'}><i class="fa-solid fa-pen-to-square" /></Button>
					</td>
				</tr>
			{/each}
		</Table>
	{/if}
</Panel>

<style>
	h2 {
		margin-bottom: 15px;
	}

	i {
		color: white;
	}
</style>
