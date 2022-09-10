<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		status: keyof typeof VotingStatus
	}

	// Types
	import type { Section } from '$models/admin/courses.model'
	import type { Student, Students } from '$models/admin/student.model'
	import type { Session } from '$models/session.model'
	import type { VotingStatus } from '$models/voting.model'
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
	import Select from '$components/HTML/Select.svelte'
	import Table from '$components/HTML/Table.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'
	import validator from '$utils/validateRut'

	// Init variables
	let token = data.user.token
	let status = data.status
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
	let formStudent = {
		name: '',
		first_lastname: '',
		second_lastname: '',
		rut: '',
		registration_number: '',
	}
	// Change status
	let why = ''
	// Data
	let students: Students
	let courses: Section[]
	let studentEdit: Student
	let studentPosition: number
	let course = ''

	onMount(async () => {
		try {
			const data = await Promise.all([
				getStudents(true, 0),
				API.fetchGetData(`${variables.API}/api/course/get_sections`, false, token),
			])
			students = data[0].body
			courses = data[1].body.sections
			onscrollLoading(students.total, async (n: number) => {
				runningLoading = true
				try {
					const dataFetch = await getStudents(false, n)
					students.users = [...students.users, ...dataFetch.body.users]
					runningLoading = false
					return n + LIMIT
				} catch (err) {
					runningLoading = false
					students = {
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
			students = {
				users: [],
			}
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getStudents(total = false, skip?: number, search?: string) {
		let URL = `${variables.API}/api/students/get_students?total=${total}&limit=${LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip >= 0) URL += `&skip=${skip}`
		const data = await API.fetchGetData(URL, false, token)
		return data
	}

	async function searchFunction() {
		try {
			students = undefined
			const dataFetch = await getStudents(false, 0, search)
			students = dataFetch.body
		} catch (err) {
			students = {
				users: [],
			}
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Upload student
	function validatorsStudent(formStudent: Student) {
		if (formStudent.name === '' || formStudent.name.length > 100)
			return { success: false, message: 'Debe existir un nombre de máx. 100 carac.' }
		if (formStudent.first_lastname === '' || formStudent.first_lastname.length > 100)
			return {
				success: false,
				message: 'Debe existir un apellido paterno de máx. 100 carac.',
			}
		if (formStudent.second_lastname === '' || formStudent.second_lastname.length > 100)
			return {
				success: false,
				message: 'Debe existir un apellido materno de máx. 100 carac.',
			}
		if (formStudent.rut.length < 10 || !validator.rutValidator(formStudent.rut))
			return {
				success: false,
				message: 'Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)',
			}
		if (formStudent.registration_number === '' || formStudent.registration_number.length > 100)
			return {
				success: false,
				message: 'Debe existir una matricula',
			}
		return { success: true }
	}

	function initForm(newStudent: Student) {
		toggleModal()
		formStudent = {
			name: '',
			first_lastname: '',
			second_lastname: '',
			rut: '',
			registration_number: '',
		}
		students.users = [newStudent, ...students.users]
	}

	async function uploadStudent() {
		try {
			const validators = validatorsStudent(formStudent)
			if (!validators.success) throw new Error(validators.message)
			const registration_number = formStudent.registration_number
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/students/new_student`,
				formStudent,
				true,
				undefined,
				token,
			)
			initForm({ ...dataFetch.body.student, registration_number })
			addToast({
				message: 'Se ha agregado el estudiante exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function editStudent() {
		try {
			const index = studentPosition
			const validators = validatorsStudent(studentEdit)
			if (!validators.success) throw new Error(validators.message)
			await API.fetchData(
				'put',
				`${variables.API}/api/students/edit_student/${studentEdit._id}`,
				{
					...studentEdit,
					course: course !== '' ? course : '',
				},
				true,
				undefined,
				token,
			)
			toggleModalEdit()
			students.users[index] = studentEdit
			addToast({
				message: 'Se ha editado con éxito el estudiante',
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
			const index = studentPosition
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')
			await API.fetchData(
				'post',
				`${variables.API}/api/students/change_status/${studentEdit._id}`,
				{ why },
				true,
				undefined,
				token,
			)
			initStatusForm()
			students.users[index].status = students.users[index].status === 1 ? 0 : 1
			addToast({
				message: 'Se ha cambiado el estado del estudiante exitosamente',
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
			title={'Agregar estudiante'}
			clickFunction={toggleModal}
			classItem={'fa-solid fa-user-plus'}
		/>
		<AIcon
			title={'Agregar estudiantes'}
			href={'/admin/estudiantes/masivo'}
			classItem={'fa-solid fa-user-group'}
		/>
		<AIcon
			title={'Iniciar votaciones estudiantiles'}
			href={status === 'opened'
				? '/admin/estudiantes/votaciones'
				: '/admin/estudiantes/votaciones/editar'}
			classItem={'fa-solid fa-check-to-slot'}
		/>
	</Icons>
	<h2>Estudiantes</h2>
	<Search search={searchFunction} bind:value={search} />
	{#if students}
		<br />
		<Table header={['Nombre', 'Ap. P', 'Ap. M', 'RUT', 'Curso', 'Matricula', 'Estado', '']}>
			{#each students.users as student, i}
				<tr>
					<td>{student.name}</td>
					<td>{student.first_lastname}</td>
					<td>{student.second_lastname}</td>
					<td>{student.rut}</td>
					<td
						>{student.course
							? `${student.course.course.course} ${student.course.section}`
							: 'Sin curso'}</td
					>
					<td>{student.registration_number}</td>
					<td>{student.status ? 'Activo' : 'Inactivo'}</td>
					<td>
						<Button
							click={() => {
								studentEdit = Object.assign({}, student)
								studentPosition = i
								course = student?.course?._id ? student.course._id : ''
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
		<h2 slot="title">Agregar estudiante</h2>
		<Form form={uploadStudent}>
			<label for="name">Nombre</label>
			<Input bind:value={formStudent.name} id="name" />
			<label for="fln">Apellido Paterno</label>
			<Input bind:value={formStudent.first_lastname} id="fln" />
			<label for="sln">Apellido Materno</label>
			<Input bind:value={formStudent.second_lastname} id="sln" />
			<label for="rut">RUT</label>
			<Input bind:value={formStudent.rut} id="rut" />
			<label for="registration_number">Matricula</label>
			<Input bind:value={formStudent.registration_number} id={'registration_number'} />
			<Button type={'submit'}>Agregar estudiante</Button>
		</Form>
	</Modal>
{/if}

{#if modalEdit}
	<Modal onClose={toggleModalEdit}>
		<h2 slot="title">
			Editar {students.users[studentPosition].name}
			{students.users[studentPosition].first_lastname}
		</h2>
		<Form form={editStudent}>
			<label for="nameE">Nombre</label>
			<Input bind:value={studentEdit.name} id="nameE" />
			<label for="flnE">Apellido Paterno</label>
			<Input bind:value={studentEdit.first_lastname} id="flnE" />
			<label for="slnE">Apellido Materno</label>
			<Input bind:value={studentEdit.second_lastname} id="slnE" />
			<label for="rutE">RUT</label>
			<Input bind:value={studentEdit.rut} id="rutE" />
			<label for="course">Curso</label>
			<Select bind:value={course} id={'course'}>
				<option value="">Sin curso</option>
				{#each courses as course}
					<option value={course._id}>{course.course.course} {course.section}</option>
				{/each}
			</Select>
			<label for="registration_numberE">Matricula</label>
			<Input bind:value={studentEdit.registration_number} id={'registration_numberE'} />
			<Button type={'submit'}>Editar estudiante</Button>
		</Form>
		{#if students.users[studentPosition].status === 1}
			<button on:click={toggleModalStatus} class="Form__button Down" type="button"
				><i class="fa-solid fa-angles-down" /> Dar de baja estudiante
			</button>
		{:else}
			<button on:click={toggleModalStatus} class="Form__button Up" type="button">
				<i class="fa-solid fa-angles-up" /> Reintegrar estudiante
			</button>
		{/if}
	</Modal>
{/if}

{#if modalStatus}
	<Modal onClose={toggleModalStatus}>
		<h2 slot="title">
			Cambiar estado directivo - {students.users[studentPosition].status === 1
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
