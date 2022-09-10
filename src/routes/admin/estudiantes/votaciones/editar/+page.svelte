<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Student, Students } from '$models/admin/student.model'
	import type { Voting } from '$models/admin/voting.model'
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Search from '$components/HTML/Search.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import { formateDateInput } from '$utils/format'

	// Init variable
	let token = data.user.token

	let search = ''
	let runningLoading = false
	let listIndex: number
	// Modal
	let modalMember = false
	const toggleModalMember = () => (modalMember = !modalMember)

	// Data
	let students: Students
	let voting: Voting

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/students/get_voting`,
				false,
				token,
			)
			voting = {
				...dataFetch.body.voting,
				start_date: formateDateInput(dataFetch.body.voting.start_date),
				finish_date: formateDateInput(dataFetch.body.voting.finish_date),
			}
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function addList() {
		voting.lists = [
			...voting.lists,
			{
				list_name: '',
				students: [],
			},
		]
	}

	async function getStudents(search: string) {
		let URL = `${variables.API}/api/students/get_students?search=${search}&actived=true`
		const data = await API.fetchGetData(URL, false, token)
		return data
	}

	async function searchFunction() {
		try {
			runningLoading = true
			students = null
			const dataFetch = await getStudents(search)
			runningLoading = false
			students = dataFetch.body
		} catch (err) {
			runningLoading = false
			students = {
				users: [],
			}
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function addMember(student: Student) {
		const listMembers = voting.lists[listIndex].students
		if (!voting.lists.some((l) => l.students.some((m) => m._id._id === student._id))) {
			voting.lists[listIndex].students = [
				...listMembers,
				{
					_id: student,
					rol: '',
				},
			]
		} else {
			addToast({
				message: 'Este alumno ya está en alguna lista',
				type: 'error',
			})
		}
	}

	async function updateVoting() {
		try {
			await API.fetchData(
				'put',
				`${variables.API}/api/students/edit_voting`,
				{
					...voting,
					lists: voting.lists.map((list) => {
						return {
							...list,
							students: list.students.map((student) => {
								return {
									_id: student._id._id,
									rol: student.rol,
								}
							}),
						}
					}),
				},
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado las votaciones exitosamente',
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
	<h2>Votaciones</h2>
	{#if voting}
		<Form form={updateVoting}>
			<h3><i class="fa-solid fa-rectangle-list" /> Listas de estudiantes</h3>
			{#each voting.lists as list, i}
				<article class="List">
					<header class="List__header">
						<span>{i + 1})</span>
						<Input placeholder={'Nombre de la lista'} bind:value={list.list_name} />
						<ButtonIcon
							classItem={'fa-solid fa-minus'}
							title={'Eliminar lista'}
							clickFunction={() => {
								voting.lists.splice(i, 1)
								voting.lists = voting.lists
							}}
						/>
					</header>
					<h4>
						<i class="fa-solid fa-people-group" />
						Miembros
						<ButtonIcon
							classItem={'fa-solid fa-circle-plus'}
							clickFunction={() => {
								toggleModalMember()
								listIndex = i
							}}
							title={'Añadir miembro'}
						/>
					</h4>
					<Table header={['Estudiante', 'Rol', '']}>
						{#each list.students as student, j}
							<tr>
								<td>
									{student._id.name}
									{student._id.first_lastname}
									{student._id.second_lastname}
								</td>
								<td>
									<Input bind:value={student.rol} />
								</td>
								<td>
									<ButtonIcon
										title={'Eliminar miembro'}
										classItem={'fa-solid fa-circle-minus'}
										clickFunction={() => {
											list.students.splice(j, 1)
											list.students = list.students
										}}
									/>
								</td>
							</tr>
						{:else}
							<tr>
								<td>Sin miembros</td>
							</tr>
						{/each}
					</Table>
				</article>
			{/each}
			<ButtonIcon
				classItem={'fa-solid fa-plus'}
				clickFunction={addList}
				title={'Añadir lista'}
			/>
			<label for="start">Fecha comienzo votaciones</label>
			<Input type={'date'} id={'start'} bind:value={voting.start_date} />
			<label for="finish">Fecha termino votaciones</label>
			<Input type={'date'} id={'finish'} bind:value={voting.finish_date} />
			<label for="period">Periodo de direcci&oacute;n (Meses)</label>
			<Input type={'number'} id={'period'} bind:value={voting.period} />
			<Button type={'submit'}>Editar votaciones</Button>
		</Form>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

{#if modalMember}
	<Modal onClose={toggleModalMember}>
		<h2 slot="title">Añadir miembro</h2>
		<Search bind:value={search} search={searchFunction} />
		<br />
		{#if students}
			<Table header={['Nombre', 'RUT', '']}>
				{#each students.users as student}
					<tr>
						<td>{student.name} {student.first_lastname} {student.second_lastname}</td>
						<td>{student.rut}</td>
						<td>
							<ButtonIcon
								classItem={'fa-solid fa-square-plus'}
								clickFunction={() => addMember(student)}
								title={'Seleccionar alumno'}
							/>
						</td>
					</tr>
				{/each}
			</Table>
		{:else if runningLoading}
			<SpinnerGet />
		{/if}
	</Modal>
{/if}

<style>
	.List {
		padding: 15px;
	}

	.List__header {
		display: flex;
		gap: 5px;
		align-items: center;
	}

	h4 {
		margin-top: 10px;
		display: flex;
		gap: 5px;
		align-items: center;
	}
</style>
