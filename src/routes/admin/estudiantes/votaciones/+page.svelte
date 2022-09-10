<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Student, Students } from '$models/admin/student.model'
	import type { Session } from '$models/session.model'
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

	// Init variable
	let token = data.user.token

	let search = ''
	let runningLoading = false
	let listIndex: number
	// Modal
	let modalMember = false
	const toggleModalMember = () => (modalMember = !modalMember)

	// Form
	let votingForm = {
		start_date: '',
		finish_date: '',
		period: '9',
		lists: [] as Array<{
			list_name: string
			students: Array<{
				_id: string
				student: string
				rol: string
			}>
		}>,
	}
	// Data
	let students: Students

	function addList() {
		votingForm.lists = [
			...votingForm.lists,
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
		const listMembers = votingForm.lists[listIndex].students
		if (!votingForm.lists.some((l) => l.students.some((m) => m._id === student._id))) {
			const studentName = `${student.name} ${student.first_lastname} ${student.second_lastname}`
			votingForm.lists[listIndex].students = [
				...listMembers,
				{
					_id: student._id,
					student: studentName,
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

	async function uploadVoting() {
		try {
			await API.fetchData(
				'post',
				`${variables.API}/api/students/upload_voting`,
				{
					...votingForm,
					lists: votingForm.lists.map((list) => {
						return {
							...list,
							students: list.students.map((student) => {
								return {
									...student,
									student: undefined,
								}
							}),
						}
					}),
				},
				true,
				undefined,
				token,
			)
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
	<Form form={uploadVoting}>
		<h3><i class="fa-solid fa-rectangle-list" /> Listas de estudiantes</h3>
		{#each votingForm.lists as list, i}
			<article class="List">
				<header class="List__header">
					<span>{i + 1})</span>
					<Input placeholder={'Nombre de la lista'} bind:value={list.list_name} />
					<ButtonIcon
						classItem={'fa-solid fa-minus'}
						title={'Eliminar lista'}
						clickFunction={() => {
							votingForm.lists.splice(i, 1)
							votingForm.lists = votingForm.lists
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
							<td>{student.student}</td>
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
		<ButtonIcon classItem={'fa-solid fa-plus'} clickFunction={addList} title={'Añadir lista'} />
		<label for="start">Fecha comienzo votaciones</label>
		<Input type={'date'} id={'start'} bind:value={votingForm.start_date} />
		<label for="finish">Fecha termino votaciones</label>
		<Input type={'date'} id={'finish'} bind:value={votingForm.finish_date} />
		<label for="period">Periodo de direcci&oacute;n (Meses)</label>
		<Input type={'number'} id={'period'} bind:value={votingForm.period} />
		<Button type={'submit'}>Empezar votaciones</Button>
	</Form>
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
