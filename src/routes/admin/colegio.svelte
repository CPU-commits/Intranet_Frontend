<script context="module">
	export function load({ session }) {
		if (session.user.user_type !== UserTypes.DIRECTOR)
			return {
				status: 401,
				error: 'No estás autorizado a esta ruta',
			}
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
	import Button from '$components/HTML/Button.svelte'
	import Input from '$components/HTML/Input.svelte'
	import VerticalTable from '$components/HTML/VerticalTable.svelte'
	import { variables } from '$lib/variables'
	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	export let token: string

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
