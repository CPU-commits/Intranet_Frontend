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
	import Button from '$components/HTML/Button.svelte'
	import Input from '$components/HTML/Input.svelte'
	import VerticalTable from '$components/HTML/VerticalTable.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	// Init variable
	let token = data.user.token

	let college = {
		direction: '',
		phone: '',
		email: '',
	}

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/college/get_college_data`,
				false,
				token,
			)
			college = dataFetch.body.college
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function uploadCollegeData() {
		try {
			if (college.direction === '' || college.email === '' || college.phone === '')
				throw new Error('Todos los campos deben ser rellenados')
			await API.fetchData(
				'post',
				`${variables.API}/api/college/update_college`,
				college,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado la información del colegio exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<Panel nav={false}>
	<h2>Colegio</h2>
	<br />
	<VerticalTable>
		<tr>
			<td>Dirección</td>
			<td><Input bind:value={college.direction} /></td>
		</tr>
		<tr>
			<td>Telef&oacute;no</td>
			<td><Input bind:value={college.phone} /></td>
		</tr>
		<tr>
			<td>Email</td>
			<td><Input bind:value={college.email} type={'email'} /></td>
		</tr>
	</VerticalTable>
	<br />
	<Button click={uploadCollegeData} type={'button'}>Actualizar datos</Button>
</Panel>
