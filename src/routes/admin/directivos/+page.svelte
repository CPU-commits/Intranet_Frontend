<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Directives } from '$models/admin/Directive.model'
	import type { Session } from '$models/session.model'
	import type { User } from '$models/users/users.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Icons from '$components/Admin/Icons.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import AIcon from '$components/HTML/AIcon.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Search from '$components/HTML/Search.svelte'
	import Table from '$components/HTML/Table.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'
	import validator from '$utils/validateRut'

	// Init variable
	let token = data.user.token
	//Search
	let search = ''
	let runningLoading = false
	const LIMIT = 30
	// Modal
	let modal = false
	let modalEdit = false
	let modalStatus = false
	const toggleModal = () => (modal = !modal)
	const toggleModalEdit = () => (modalEdit = !modalEdit)
	const toggleModalStatus = () => {
		modalStatus = !modalStatus
		modalEdit = false
	}
	// Form
	let formDirective = {
		name: '',
		first_lastname: '',
		second_lastname: '',
		rut: '',
	}
	// Change status
	let why = ''
	// Data
	let directives: Directives
	let directiveEdit: User
	let directivePosition: number

	onMount(async () => {
		try {
			const data = await getDirectives(true, 0)
			directives = data.body
			onscrollLoading(directives.total, async (n: number) => {
				runningLoading = true
				try {
					const dataFetch = await getDirectives(false, n)
					directives.users = [...directives.users, ...dataFetch.body.users]
					runningLoading = false
					return n + LIMIT
				} catch (err) {
					runningLoading = false
					directives = {
						users: [],
					}
					addToast({
						message: err.message,
						type: 'error',
					})
					return n
				}
			})
		} catch (err) {
			directives = {
				users: [],
			}
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
		const data = await API.fetchGetData(URL, false, token)
		return data
	}

	async function searchFunction() {
		try {
			directives = undefined
			const dataFetch = await getDirectives(false, 0, search)
			directives = dataFetch.body
		} catch (err) {
			directives = {
				users: [],
			}
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Upload directive
	function validatorsDirective(formDirective: User) {
		if (formDirective.name === '' || formDirective.name.length > 100)
			return { success: false, message: 'Debe existir un nombre de máx. 100 carac.' }
		if (formDirective.first_lastname === '' || formDirective.first_lastname.length > 100)
			return {
				success: false,
				message: 'Debe existir un apellido paterno de máx. 100 carac.',
			}
		if (formDirective.second_lastname === '' || formDirective.second_lastname.length > 100)
			return {
				success: false,
				message: 'Debe existir un apellido materno de máx. 100 carac.',
			}
		if (formDirective.rut.length < 10 || !validator.rutValidator(formDirective.rut))
			return {
				success: false,
				message: 'Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)',
			}
		return { success: true }
	}

	function initForm(newDirective: User) {
		toggleModal()
		formDirective = {
			name: '',
			first_lastname: '',
			second_lastname: '',
			rut: '',
		}
		directives.users = [newDirective, ...directives.users]
	}

	async function uploadDirective() {
		try {
			const validators = validatorsDirective(formDirective)
			if (!validators.success) throw new Error(validators.message)
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/directive/new_directive`,
				formDirective,
				true,
				undefined,
				token,
			)
			initForm(dataFetch.body.directive)
			addToast({
				message: 'Se ha agregado el directivo exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function editDirective() {
		try {
			const index = directivePosition
			const validators = validatorsDirective(directiveEdit)
			if (!validators.success) throw new Error(validators.message)
			await API.fetchData(
				'put',
				`${variables.API}/api/directive/edit_directive/${directiveEdit._id}`,
				directiveEdit,
				true,
				undefined,
				token,
			)
			toggleModalEdit()
			directives.users[index] = directiveEdit
			addToast({
				message: 'Se ha editado con éxito el directivo',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Change status
	function initStatusForm() {
		why = ''
		toggleModalStatus()
	}

	async function changeStatus() {
		try {
			const index = directivePosition
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')
			await API.fetchData(
				'post',
				`${variables.API}/api/directive/change_status/${directiveEdit._id}`,
				{ why },
				true,
				undefined,
				token,
			)
			initStatusForm()
			directives.users[index].status = directives.users[index].status === 1 ? 0 : 1
			addToast({
				message: 'Se ha cambiado el estado del directivo exitosamente',
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
			title={'Agregar directivo'}
			clickFunction={toggleModal}
			classItem={'fa-solid fa-user-plus'}
		/>
		<AIcon
			title={'Agregar directivos'}
			href={'/admin/directivos/masivo'}
			classItem={'fa-solid fa-user-group'}
		/>
	</Icons>
	<h2>Directivos</h2>
	<Search search={searchFunction} bind:value={search} />
	{#if directives}
		<br />
		<Table header={['Nombre', 'Ap. P', 'Ap. M', 'RUT', 'Estado', '']}>
			{#each directives.users as directive, i}
				<tr>
					<td>{directive.name}</td>
					<td>{directive.first_lastname}</td>
					<td>{directive.second_lastname}</td>
					<td>{directive.rut}</td>
					<td>{directive.status ? 'Activo' : 'Inactivo'}</td>
					<td>
						<Button
							click={() => {
								directiveEdit = Object.assign({}, directive)
								directivePosition = i
								toggleModalEdit()
							}}
							type={'button'}><i class="fa-solid fa-pen-to-square" /></Button
						>
					</td>
				</tr>
			{:else}
				<td>No hay datos</td>
			{/each}
		</Table>
		{#if runningLoading}
			<SpinnerGet />
		{/if}
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

<!-- Modals -->
{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Agregar directivo</h2>
		<Form form={uploadDirective}>
			<label for="name">Nombre</label>
			<Input bind:value={formDirective.name} id="name" />
			<label for="fln">Apellido Paterno</label>
			<Input bind:value={formDirective.first_lastname} id="fln" />
			<label for="sln">Apellido Materno</label>
			<Input bind:value={formDirective.second_lastname} id="sln" />
			<label for="rut">RUT</label>
			<Input bind:value={formDirective.rut} id="rut" />
			<Button type={'submit'}>Agregar directivo</Button>
		</Form>
	</Modal>
{/if}

{#if modalEdit}
	<Modal onClose={toggleModalEdit}>
		<h2 slot="title">
			Editar {directives.users[directivePosition].name}
			{directives.users[directivePosition].first_lastname}
		</h2>
		<Form form={editDirective}>
			<label for="nameE">Nombre</label>
			<Input bind:value={directiveEdit.name} id="nameE" />
			<label for="flnE">Apellido Paterno</label>
			<Input bind:value={directiveEdit.first_lastname} id="flnE" />
			<label for="slnE">Apellido Materno</label>
			<Input bind:value={directiveEdit.second_lastname} id="slnE" />
			<label for="rutE">RUT</label>
			<Input bind:value={directiveEdit.rut} id="rutE" />
			<Button type={'submit'}>Editar directivo</Button>
		</Form>
		{#if directives.users[directivePosition].status === 1}
			<button on:click={toggleModalStatus} class="Form__button Down" type="button"
				><i class="fa-solid fa-angles-down" /> Dar de baja directivo
			</button>
		{:else}
			<button on:click={toggleModalStatus} class="Form__button Up" type="button">
				<i class="fa-solid fa-angles-up" /> Reintegrar directivo
			</button>
		{/if}
	</Modal>
{/if}

{#if modalStatus}
	<Modal onClose={toggleModalStatus}>
		<h2 slot="title">
			Cambiar estado directivo - {directives.users[directivePosition].status === 1
				? 'Dar de baja'
				: 'Reintegrar'}
		</h2>
		<Form form={changeStatus}>
			<label for="why">Motivo</label>
			<TextArea bind:value={why} />
			<Button type={'submit'}>Cambiar estado</Button>
		</Form>
	</Modal>
{/if}

<style lang="scss">
	h2 {
		margin-bottom: 15px;
	}

	i {
		color: white;
	}

	.Form__button {
		position: absolute;
		top: 75px;
		background: transparent;
		border: none;
	}

	.Down {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	.Up {
		color: var(--color-main);
		i {
			color: var(--color-main);
		}
	}
</style>
