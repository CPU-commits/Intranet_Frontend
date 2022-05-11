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
	import { goto } from '$app/navigation'

	export let token: string

	import Icons from '$components/Admin/Icons.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'
	import type { User } from '$models/users/users.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import validator from '$utils/validateRut'

	// Data
	let teachers: Array<User> = [
		{
			name: '',
			first_lastname: '',
			second_lastname: '',
			rut: '',
		},
	]
	// Modal
	let modal = false
	const toggleModal = () => (modal = !modal)
	// Cells
	let cells = 0

	function deleteCell(position: number) {
		teachers.splice(position, 1)
		teachers = [...teachers]
	}

	function addCells() {
		for (let i = 0; i < cells; i++) {
			teachers = [
				...teachers,
				{
					name: '',
					first_lastname: '',
					second_lastname: '',
					rut: '',
				},
			]
		}
		cells = 0
		toggleModal()
	}
	// Upload data
	function validateCells() {
		if (teachers.length === 0) return { sucess: false, message: 'No hay celdas' }
		for (let i = 0; i < teachers.length; i++) {
			const teacher = teachers[i]
			if (teacher.name === '' || teacher.name.length > 100)
				return { success: false, message: 'Debe existir un nombre de máx. 100 carac.' }
			if (teacher.first_lastname === '' || teacher.first_lastname.length > 100)
				return {
					success: false,
					message: 'Debe existir un apellido paterno de máx. 100 carac.',
				}
			if (teacher.second_lastname === '' || teacher.second_lastname.length > 100)
				return {
					success: false,
					message: 'Debe existir un apellido materno de máx. 100 carac.',
				}
			if (teacher.rut.length < 10 || !validator.rutValidator(teacher.rut))
				return {
					success: false,
					message: 'Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)',
				}
		}
		return { success: true }
	}

	async function uploadCells() {
		try {
			const validators = validateCells()
			if (!validators.success) throw new Error(validators.message)
			await API.fetchData(
				'post',
				`${variables.API}/api/teachers/new_teachers`,
				teachers,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se han agregado los profesores exitosamente',
				type: 'success',
			})
			goto('/admin/profesores')
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
			title={'Agregar celdas'}
			classItem={'fa-solid fa-plus'}
			clickFunction={toggleModal}
		/>
		<ButtonIcon
			title={'Subir profesores'}
			classItem={'fa-solid fa-arrow-up-from-bracket'}
			clickFunction={uploadCells}
		/>
	</Icons>
	<h2>Tabla profesores</h2>
	<br />
	<Table header={['Nombre', 'Ap. P', 'Ap. M', 'RUT', '']}>
		{#each teachers as teacher, i}
			<tr>
				<td>
					<Input bind:value={teacher.name} id={`N${i}`} />
				</td>
				<td>
					<Input bind:value={teacher.first_lastname} id={`FL${i}`} />
				</td>
				<td>
					<Input bind:value={teacher.second_lastname} id={`SL${i}`} />
				</td>
				<td>
					<Input bind:value={teacher.rut} id={`R${i}`} />
				</td>
				<td>
					<ButtonIcon
						clickFunction={() => deleteCell(i)}
						classItem={'fa-solid fa-minus'}
					/>
				</td>
			</tr>
		{/each}
	</Table>
</Panel>

<!-- Modals -->
{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Agregar celdas</h2>
		<Form form={addCells}>
			<label for="cells">Cantidad de celdas</label>
			<Input bind:value={cells} type={'number'} id={'cells'} />
			<Button type={'submit'}>Agregar celdas</Button>
		</Form>
	</Modal>
{/if}
