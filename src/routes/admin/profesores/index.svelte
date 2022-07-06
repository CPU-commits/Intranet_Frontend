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
	import { variables } from '$lib/variables'
	import type { Course } from '$models/admin/courses.model'
	import type { Teacher, Teachers } from '$models/admin/teacher.model'
	import type { User } from '$models/users/users.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'
	import validator from '$utils/validateRut'
	import { onMount } from 'svelte'

	//Search
	let search = ''
	let runningLoading = false
	const LIMIT = 30
	// Modal
	let modal = false
	let modalSubjects = false
	let modalEdit = false
	let modalStatus = false
	const toggleModal = () => (modal = !modal)
	const toggleModalEdit = () => (modalEdit = !modalEdit)
	const toggleSubjects = () => (modalSubjects = !modalSubjects)
	const toggleModalStatus = () => {
		modalStatus = !modalStatus
		modalEdit = false
	}
	// Form
	let formTeacher = {
		name: '',
		first_lastname: '',
		second_lastname: '',
		rut: '',
	}
	let subject = ''
	// Change status
	let why = ''
	// Data
	let teachers: Teachers
	let courses: Course[]
	// Form edit
	let teacherEdit: Teacher
	let teacherPosition: number

	onMount(async () => {
		try {
			const data = await Promise.all([
				getTeachers(true, 0),
				API.fetchGetData(`${variables.API}/api/course/get_courses`, false, token),
			])
			teachers = data[0].body
			courses = data[1].body.courses
			onscrollLoading(teachers.total, async (n: number) => {
				runningLoading = true
				try {
					const dataFetch = await getTeachers(false, n)
					teachers.users = [...teachers.users, ...dataFetch.body.users]
					runningLoading = false
					return n + LIMIT
				} catch (err) {
					runningLoading = false
					teachers = {
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
			teachers = {
				users: [],
			}
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getTeachers(total = false, skip?: number, search?: string) {
		let URL = `${variables.API}/api/teachers/get_teachers?total=${total}&limit=${LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip >= 0) URL += `&skip=${skip}`
		const data = await API.fetchGetData(URL, false, token)
		return data
	}

	let timeout: any
	async function searchFunction() {
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(async () => {
			try {
				teachers = undefined
				const dataFetch = await getTeachers(false, 0, search)
				teachers = dataFetch.body
			} catch (err) {
				teachers = {
					users: [],
				}
				addToast({
					message: err.message,
					type: 'error',
				})
			}
		}, 500)
	}
	// Upload teacher
	function validatorsTeacher(formTeacher: User) {
		if (formTeacher.name === '' || formTeacher.name.length > 100)
			return { success: false, message: 'Debe existir un nombre de máx. 100 carac.' }
		if (formTeacher.first_lastname === '' || formTeacher.first_lastname.length > 100)
			return {
				success: false,
				message: 'Debe existir un apellido paterno de máx. 100 carac.',
			}
		if (formTeacher.second_lastname === '' || formTeacher.second_lastname.length > 100)
			return {
				success: false,
				message: 'Debe existir un apellido materno de máx. 100 carac.',
			}
		if (formTeacher.rut.length < 10 || !validator.rutValidator(formTeacher.rut))
			return {
				success: false,
				message: 'Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)',
			}
		return { success: true }
	}

	function initForm(newTeacher: Teacher) {
		toggleModal()
		formTeacher = {
			name: '',
			first_lastname: '',
			second_lastname: '',
			rut: '',
		}
		teachers.users = [newTeacher, ...teachers.users]
	}

	async function uploadTeacher() {
		try {
			const validators = validatorsTeacher(formTeacher)
			if (!validators.success) throw new Error(validators.message)
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/teachers/new_teacher`,
				formTeacher,
				true,
				undefined,
				token,
			)
			initForm(dataFetch.body.teacher)
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

	async function editTeacher() {
		try {
			const index = teacherPosition
			const validators = validatorsTeacher(teacherEdit.user)
			if (!validators.success) throw new Error(validators.message)
			await API.fetchData(
				'put',
				`${variables.API}/api/teachers/edit_teacher/${teacherEdit.user._id}`,
				teacherEdit,
				true,
				undefined,
				token,
			)
			toggleModalEdit()
			teachers.users[index] = teacherEdit
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
	// Add subject course
	async function addSubjectCourse() {
		try {
			if (subject === '') throw new Error('Debe seleccionar una materia - curso')
			const subjectCourse = subject.split('-')
			const id = teachers.users[teacherPosition]._id
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/teachers/add_subject_course/${id}`,
				{ course: subjectCourse[0], subject: subjectCourse[1] },
				true,
				undefined,
				token,
			)
			console.log(dataFetch.body)
			teachers.users[teacherPosition] = dataFetch.body
			addToast({
				message: 'Se ha agregado exitosamente la materia/curso',
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
			const index = teacherPosition
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')
			await API.fetchData(
				'post',
				`${variables.API}/api/directive/change_status/${teacherEdit.user._id}`,
				{ why },
				true,
				undefined,
				token,
			)
			initStatusForm()
			teachers.users[index].user.status = teachers.users[index].user.status === 1 ? 0 : 1
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
			title={'Agregar profesore'}
			clickFunction={toggleModal}
			classItem={'fa-solid fa-user-plus'}
		/>
		<AIcon
			title={'Agregar profesores'}
			href={'/admin/profesores/masivo'}
			classItem={'fa-solid fa-user-group'}
		/>
	</Icons>
	<h2>Profesores</h2>
	<Search search={searchFunction} bind:value={search} />
	{#if teachers}
		<br />
		<Table header={['Nombre', 'Ap. P', 'Ap. M', 'RUT', 'Estado', 'Materias', '']}>
			{#each teachers.users as teacher, i}
				<tr>
					<td>{teacher.user.name}</td>
					<td>{teacher.user.first_lastname}</td>
					<td>{teacher.user.second_lastname}</td>
					<td>{teacher.user.rut}</td>
					<td>{teacher.user.status ? 'Activo' : 'Inactivo'}</td>
					<td>
						<Button
							type={'button'}
							click={() => {
								toggleSubjects()
								teacherPosition = i
							}}
						>
							<i class="fa-solid fa-book-bookmark s-Ss2zncTxuoSI" />
						</Button>
					</td>
					<td>
						<Button
							click={() => {
								teacherEdit = Object.assign({}, teacher)
								teacherPosition = i
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
		<h2 slot="title">Agregar profesor</h2>
		<Form form={uploadTeacher}>
			<label for="name">Nombre</label>
			<Input bind:value={formTeacher.name} id="name" />
			<label for="fln">Apellido Paterno</label>
			<Input bind:value={formTeacher.first_lastname} id="fln" />
			<label for="sln">Apellido Materno</label>
			<Input bind:value={formTeacher.second_lastname} id="sln" />
			<label for="rut">RUT</label>
			<Input bind:value={formTeacher.rut} id="rut" />
			<Button type={'submit'}>Agregar profesor</Button>
		</Form>
	</Modal>
{/if}

{#if modalSubjects}
	<Modal onClose={toggleSubjects}>
		<h2 slot="title">
			Materias {teachers.users[teacherPosition].user.name}
			{teachers.users[teacherPosition].user.first_lastname}
		</h2>
		<Form form={addSubjectCourse}>
			<label for="subject">Materia - Curso</label>
			{#if courses}
				<Select bind:value={subject} id={'subject'}>
					<option value="">Seleccione una materia - curso</option>
					{#each courses as course}
						{#each course.subjects as subject}
							{#each course.sections as section}
								<option value="{section._id}-{subject._id}"
									>{course.course} {section.section} {subject.subject}</option
								>
							{/each}
						{/each}
					{/each}
				</Select>
			{/if}
			<Button type={'submit'}>Agregar materia/curso al profesor</Button>
		</Form>
		<br />
		<Table header={['Materia', 'Curso']}>
			{#each teachers.users[teacherPosition].imparted as imparted}
				<tr>
					<td>{imparted.subject.subject}</td>
					<td>{imparted.course.course.course} {imparted.course.section}</td>
				</tr>
			{/each}
		</Table>
	</Modal>
{/if}

{#if modalEdit}
	<Modal onClose={toggleModalEdit}>
		<h2 slot="title">
			Editar {teachers.users[teacherPosition].user.name}
			{teachers.users[teacherPosition].user.first_lastname}
		</h2>
		<Form form={editTeacher}>
			<label for="nameE">Nombre</label>
			<Input bind:value={teacherEdit.user.name} id="nameE" />
			<label for="flnE">Apellido Paterno</label>
			<Input bind:value={teacherEdit.user.first_lastname} id="flnE" />
			<label for="slnE">Apellido Materno</label>
			<Input bind:value={teacherEdit.user.second_lastname} id="slnE" />
			<label for="rutE">RUT</label>
			<Input bind:value={teacherEdit.user.rut} id="rutE" />
			<Button type={'submit'}>Editar profesor</Button>
		</Form>
		{#if teachers.users[teacherPosition].user.status === 1}
			<button on:click={toggleModalStatus} class="Form__button Down" type="button"
				><i class="fa-solid fa-angles-down" /> Dar de baja profesor
			</button>
		{:else}
			<button on:click={toggleModalStatus} class="Form__button Up" type="button">
				<i class="fa-solid fa-angles-up" /> Reintegrar profesor
			</button>
		{/if}
	</Modal>
{/if}

{#if modalStatus}
	<Modal onClose={toggleModalStatus}>
		<h2 slot="title">
			Cambiar estado profesor - {teachers.users[teacherPosition].user.status === 1
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
