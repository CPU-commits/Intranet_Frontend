<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	import type { User } from '$models/users/users.model'
	// Svelte
	import { goto } from '$app/navigation'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Icons from '$components/Admin/Icons.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import validator from '$utils/validateRut'

	// Init variable
	let token = data.user.token
	// Data
	let directives: Array<User> = [
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
		directives.splice(position, 1)
		directives = [...directives]
	}

	function addCells() {
		for (let i = 0; i < cells; i++) {
			directives = [
				...directives,
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
		if (directives.length === 0) return { sucess: false, message: 'No hay celdas' }
		for (let i = 0; i < directives.length; i++) {
			const directive = directives[i]
			if (directive.name === '' || directive.name.length > 100)
				return { success: false, message: 'Debe existir un nombre de máx. 100 carac.' }
			if (directive.first_lastname === '' || directive.first_lastname.length > 100)
				return {
					success: false,
					message: 'Debe existir un apellido paterno de máx. 100 carac.',
				}
			if (directive.second_lastname === '' || directive.second_lastname.length > 100)
				return {
					success: false,
					message: 'Debe existir un apellido materno de máx. 100 carac.',
				}
			if (directive.rut.length < 10 || !validator.rutValidator(directive.rut))
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
				`${variables.API}/api/directive/new_directives`,
				directives,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se han agregado los directivos exitosamente',
				type: 'success',
			})
			goto('/admin/directivos')
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
			title={'Subir directivos'}
			classItem={'fa-solid fa-arrow-up-from-bracket'}
			clickFunction={uploadCells}
		/>
	</Icons>
	<h2>Tabla directivos</h2>
	<br />
	<Table header={['Nombre', 'Ap. P', 'Ap. M', 'RUT', '']}>
		{#each directives as directive, i}
			<tr>
				<td>
					<Input bind:value={directive.name} id={`N${i}`} />
				</td>
				<td>
					<Input bind:value={directive.first_lastname} id={`FL${i}`} />
				</td>
				<td>
					<Input bind:value={directive.second_lastname} id={`SL${i}`} />
				</td>
				<td>
					<Input bind:value={directive.rut} id={`R${i}`} />
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
