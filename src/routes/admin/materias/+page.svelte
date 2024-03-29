<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Specialty } from '$models/admin/specialties.model'
	import type { Subject } from '$models/admin/subjects.model'
	import type { Session } from '$models/session.model'
	import type { Course } from '$models/admin/courses.model'
	// Svelte
	import { onMount } from 'svelte'
    // Stores
    import { addToast } from '$stores/toasts'
	// Components
	import Icons from '$components/Admin/Icons.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	// Init variable
	let token = data.user.token
	// Modal
	let modalSpecialty = false
	let modalSubject = false
	let modalAnchor = false
	let modalCourseSubjects = false
	const toggleSpecialty = () => (modalSpecialty = !modalSpecialty)
	const toggleSubject = () => (modalSubject = !modalSubject)
	const toggleAnchor = () => (modalAnchor = !modalAnchor)
	const toggleCourseSubjects = (id?: string, index?: number) => {
		subjectAnchor = ''
		courseId = id
		coursePosition = index
		modalCourseSubjects = !modalCourseSubjects
		courseEdit = courses[index]
		toggleAnchor()
	}
	// Form
	let specialty = ''
	let subject = {
		subject: '',
		specialty: '',
	}
	let subjectAnchor = ''
	// Anchor
	let courseId: string
	let courseEdit: Course
	let coursePosition: number
	//Data
	let subjects: Subject[]
	let specialties: Specialty[]
	let courses: Course[]

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(`${variables.API}/api/subjects/get_subjects`, false, token),
				API.fetchGetData(`${variables.API}/api/subjects/get_specialties`, false, token),
				API.fetchGetData(`${variables.API}/api/course/get_courses`, false, token),
			]).then((data) => {
				return {
					subjects: data[0].body.subjects,
					specialties: data[1].body.specialties,
					course: data[2].body.courses,
				}
			})
			// Assign
			subjects = dataFetch.subjects
			specialties = dataFetch.specialties
			courses = dataFetch.course
			console.log(courses)
		} catch (err) {
			subjects = []
			specialties = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
	// Specialties
	async function newSpecialty() {
		try {
			if (specialty === '' || specialty.length > 100)
				throw new Error('Debe existir una especialidad de máx. 100 cárac.')
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/subjects/new_specialty`,
				{ specialty },
				true,
				undefined,
				token,
			)
			// Form
			specialty = ''
			specialties = [dataFetch.body.specialty, ...specialties]
			addToast({
				message: 'Se ha agregado la especialidad exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteSpecialty(id: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API}/api/subjects/delete_specialty/${id}`,
				true,
				token,
			)
			specialties = specialties.filter((specialty) => {
				if (specialty._id !== id) return specialty
			})
			addToast({
				message: 'Se ha eliminado la especialidad exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Subjects
	async function newSubject() {
		try {
			if (subject.subject === '' || subject.subject.length > 100)
				throw new Error('Debe existir una materia de máx. 100 cárac.')
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/subjects/new_subject`,
				{
					subject: subject.subject,
					specialty: subject.specialty === '' ? undefined : subject.specialty,
				},
				true,
				undefined,
				token,
			)
			// Form
			subject.subject = ''
			subject.specialty = ''
			// Data
			subjects = [dataFetch.body.subject, ...subjects]
			modalSubject = false
			addToast({
				message: 'Se ha agregado la especialidad exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteSubject(id: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API}/api/subjects/delete_subject/${id}`,
				true,
				token,
			)
			subjects = subjects.filter((subject) => {
				if (subject._id !== id) return subject
			})
			addToast({
				message: 'Se ha eliminado la materia exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Anchor
	async function addSubject() {
		try {
			if (subjectAnchor === '')
				throw new Error('Debe seleccionar una materia que anclar al curso')
			const cPosition = coursePosition
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/subjects/add_subject`,
				{
					course: courseId,
					subject: subjectAnchor,
				},
				true,
				undefined,
				token,
			)
			// Add subject
			courses[cPosition].subjects.push(dataFetch.body.subject)
			courseEdit = courses[cPosition]
			addToast({
				message: 'Se ha anclado la materia al curso exitosamente',
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
			clickFunction={toggleSubject}
			title={'Agregar materia'}
			classItem={'fa-solid fa-plus'}
		/>
		<ButtonIcon
			clickFunction={toggleSpecialty}
			title={'Especialidades'}
			classItem={'fa-solid fa-puzzle-piece'}
		/>
		<ButtonIcon
			clickFunction={toggleAnchor}
			title={'Anclajes'}
			classItem={'fa-solid fa-anchor'}
		/>
	</Icons>
	<h2>Materias</h2>
	<br />
	{#if subjects}
		<Table header={['Materia', 'Especialidad', '']}>
			{#each subjects as subject}
				<tr>
					<td>{subject.subject}</td>
					<td>{subject.specialty ? subject.specialty.specialty : 'Sin asignar'}</td>
					<td>
						<Button click={() => deleteSubject(subject._id)} type={'button'}>
							<i class="fa-solid fa-minus" />
						</Button>
					</td>
				</tr>
			{:else}
				<td>No hay datos...</td>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

<!-- Modals -->
{#if modalSpecialty}
	<Modal onClose={toggleSpecialty}>
		<h2 slot="title">Especialidades</h2>
		<Form form={newSpecialty}>
			<label for="specialty">Especialidad</label>
			<Input id={'specialty'} bind:value={specialty} />
			<Button type={'submit'}>Agregar especialidad</Button>
		</Form>
		<br />
		{#if specialties}
			<Table header={['Especialidad', '']}>
				{#each specialties as specialty}
					<tr>
						<td>{specialty.specialty}</td>
						<td>
							<ButtonIcon
								title={'Eliminar especialidad'}
								clickFunction={() => deleteSpecialty(specialty._id)}
								classItem={'fa-solid fa-minus'}
							/>
						</td>
					</tr>
				{:else}
					<td>No hay datos...</td>
				{/each}
			</Table>
		{/if}
	</Modal>
{/if}

{#if modalSubject}
	<Modal onClose={toggleSubject}>
		<h2 slot="title">Agregar materia</h2>
		<Form form={newSubject}>
			<label for="subject">Materia</label>
			<Input bind:value={subject.subject} id={'subject'} />
			<label for="specialty">Especialidad</label>
			<Select id={'specialty'} bind:value={subject.specialty}>
				<option value="">Sin especialidad</option>
				{#each specialties as specialty}
					<option value={specialty._id}>{specialty.specialty}</option>
				{/each}
			</Select>
			<Button type={'submit'}>Agregar materia</Button>
		</Form>
	</Modal>
{/if}

{#if modalAnchor}
	<Modal onClose={toggleAnchor}>
		<h2 slot="title">
			Anclaje Materias - Cursos ( <i class="fa-solid fa-book-bookmark" /> -
			<i class="fa-solid fa-layer-group" /> )
		</h2>
		<Table header={['Curso', 'Materias']}>
			{#each courses as course, i}
				<tr>
					<td>{course.course}</td>
					<td>
						<Button click={() => toggleCourseSubjects(course._id, i)} type={'button'}>
							<i class="fa-solid fa-book-bookmark" />
						</Button>
					</td>
				</tr>
			{/each}
		</Table>
	</Modal>
{/if}

{#if modalCourseSubjects}
	<Modal onClose={toggleCourseSubjects}>
		<h2 slot="title">
			Materias {courses[coursePosition].course}
		</h2>
		<Form form={addSubject}>
			<label for="subject-a">Materia</label>
			<Select bind:value={subjectAnchor} id={'subject-a'}>
				<option value="">Selecione una materia</option>
				{#each subjects as subject}
					{#if !courseEdit.subjects.some((s) => s._id === subject._id)}
						<option value={subject._id}>{subject.subject}</option>
					{/if}
				{/each}
			</Select>
			<Button type={'submit'}>Agregar anclaje a {courses[coursePosition].course}</Button>
		</Form>
		<br />
		<Table header={['Materia', '']}>
			{#each courseEdit.subjects as subject}
				<tr>
					<td>{subject.subject}</td>
					<td
						><ButtonIcon
							clickFunction={toggleAnchor}
							classItem={'fa-solid fa-minus'}
						/></td
					>
				</tr>
			{:else}
				<td>No hay datos...</td>
			{/each}
		</Table>
	</Modal>
{/if}

<style>
	h2 i {
		color: var(--color-main);
		font-size: 20px;
	}

	i {
		color: white;
	}
</style>
