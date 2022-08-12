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
	import Icons from '$components/Admin/Icons.svelte'

	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	export let token: string
	// Modals
	let modalGrade = false
	const toggleGrade = () => (modalGrade = !modalGrade)

	let gradeConfig = {
		min: '',
		max: '',
	}

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(`${variables.API}/api/classroom/get_grade_config`, false, token),
			])
			gradeConfig = dataFetch[0].body.gradeConfig
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function uploadGrades() {
		try {
			if (gradeConfig.max === '' || gradeConfig.min === '')
				throw new Error('Los campos no pueden estar vacíos')
			if (!Number.isInteger(gradeConfig.max) || !Number.isInteger(gradeConfig.min))
				throw new Error('Las calificaciones deben ser enteros')
			await API.fetchData(
				'post',
				`${variables.API}/api/classroom/update_grades_config`,
				gradeConfig,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado la configuración de calificaciones exitosamente',
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

<Panel>
	<Icons slot="nav">
		<ButtonIcon
			title={'Calificaciones'}
			classItem={'fa-solid fa-feather-pointed'}
			clickFunction={toggleGrade}
		/>
	</Icons>
</Panel>

{#if modalGrade}
	<Modal onClose={toggleGrade}>
		<h2 slot="title">Calificaciones</h2>
		<Form form={uploadGrades}>
			<label for="min">Calificaci&oacute;n m&iacute;nima</label>
			<Input id={'min'} bind:value={gradeConfig.min} />
			<label for="max">Calificaci&oacute;n m&aacute;xima</label>
			<Input id={'max'} bind:value={gradeConfig.max} />
			<Button type={'submit'}>Actualizar configuraci&oacute;n</Button>
		</Form>
	</Modal>
{/if}
