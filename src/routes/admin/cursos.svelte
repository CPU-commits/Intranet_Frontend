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
	import MapElement from '$components/Admin/MapElement.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { Course } from '$models/admin/courses.model'
	import type { Cycle } from '$models/admin/cycles.model'
	import type { Teacher } from '$models/admin/teacher.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'
	// Data
	let courses: Course[]
	let cycles: Cycle[]
	let teachers: Teacher[]
	// Modal
	let modalCycle = false
	let modalCourse = false
	let modalMap = false
	let modalSections = false
	let modalEdit = false
	const toggleCycle = () => (modalCycle = !modalCycle)
	const toggleCourse = () => (modalCourse = !modalCourse)
	const toggleMap = () => (modalMap = !modalMap)
	const toggleSections = (i: number) => {
		positionCourse = i
		modalSections = !modalSections
	}
	const toggleEdit = (i: number) => {
		positionCourse = i
		modalEdit = !modalEdit
	}
	// Forms
	let cycle = ''
	let section = ''
	let courseForm = {
		course: '',
		cycle: '',
		level: 0,
	}
	// Dangers
	let first: boolean
	let consecutive: boolean
	let final: boolean
	// Edit
	let positionCourse: number
	let courseEdit: Course

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(`${variables.API}/api/course/get_courses`, false, token),
				API.fetchGetData(`${variables.API}/api/course/get_cycles`, false, token),
				API.fetchGetData(
					`${variables.API}/api/teachers/get_teachers?total=false&skip=0`,
					false,
					token,
				),
			]).then((data) => {
				return {
					courses: data[0].body.courses,
					cycles: data[1].body.cycles,
					teachers: data[2].body.users,
				}
			})
			courses = dataFetch.courses
			cycles = dataFetch.cycles
			teachers = dataFetch.teachers
			console.log(courses)
			// Dangers init
			recalculateDangers()
		} catch (err) {
			courses = []
			cycles = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
	function findElementByLevel(level: number) {
		const element = courses.filter((course) => {
			if (course.level === level) return course
		})
		return element[0] ? element[0] : null
	}

	function isConsecutive() {
		if (courses.length > 0) {
			let afterElement = courses[0]
			for (let i = 1; i < courses.length; i++) {
				const element = courses[i]
				if (element.level - 1 !== afterElement.level) return false
				afterElement = element
			}
		} else {
			return false
		}
		return true
	}

	function existsFinal() {
		return courses.some((c) => c.isFinal)
	}

	function recalculateDangers() {
		first = !findElementByLevel(1)
		consecutive = !isConsecutive()
		final = !existsFinal()
	}

	// Cycles
	async function newCycle() {
		try {
			if (cycle === '' || cycle.length > 100)
				throw new Error('Debe existir un ciclo con máx. 100 cárac.')
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/course/new_cycle`,
				{ cycle },
				true,
				undefined,
				token,
			)
			cycle = ''
			cycles = [dataFetch.body.cycle, ...cycles]
			addToast({
				message: 'Se ha agregado exitosamente el ciclo',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteCycle(id: string, i: number) {
		try {
			await API.fetchData(
				'post',
				`${variables.API}/api/course/delete_cycle/${id}`,
				{ cycle },
				true,
				undefined,
				token,
			)
			cycles.splice(i, 1)
			cycles = [...cycles]
			addToast({
				message: 'Se ha eliminado exitosamente el ciclo',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Course
	function validateCourse(courseForm) {
		if (courseForm.course === '' || courseForm.course.length > 100)
			return { success: false, message: 'Debe existir un curso con máx 100 cárac.' }
		if (courseForm.cycle === '') return { success: false, message: 'Debe seleccionar un ciclo' }
		if (courseForm.level <= 0)
			return { success: false, message: 'Debe existir un nivel/grado mayor a 0' }
		if (courseForm.quantity <= 0)
			return { success: false, message: 'Debe existir una cantidad mayor a 0' }
		return { success: true }
	}

	function initCourse() {
		courseForm = {
			course: '',
			cycle: '',
			level: 0,
		}
	}

	async function newCourse() {
		try {
			const validators = validateCourse(courseForm)
			if (!validators.success) throw new Error(validators.message)
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/course/new_course`,
				courseForm,
				true,
				undefined,
				token,
			)
			initCourse()
			courses = [dataFetch.body.course, ...courses]
			modalCourse = false
			// Sort
			courses.sort((a, b) => {
				return a.level - b.level
			})
			// Dangers
			recalculateDangers()
			addToast({
				message: 'Se ha agregado el curso exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function updateCourse() {
		try {
			const index = positionCourse
			const validators = validateCourse(courseEdit)
			if (!validators.success) throw new Error(validators.message)
			const dataFetch = await API.fetchData(
				'put',
				`${variables.API}/api/course/update_course/${courseEdit._id}`,
				{
					course: courseEdit.course,
					cycle: courseEdit.cycle._id,
					isFinal: courseEdit.isFinal === 'true',
					level: courseEdit.level,
				},
				true,
				undefined,
				token,
			)
			modalEdit = false
			courses[index] = dataFetch.body.course
			// Dangers
			recalculateDangers()
			addToast({
				message: 'Se ha actualizado el curso exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteCourse(id: string) {
		try {
			const index = positionCourse
			await API.fetchDeleteData(
				`${variables.API}/api/course/delete_course/${id}`,
				true,
				token,
			)
			// Delete
			modalEdit = false
			courses.splice(index, 1)
			courses = [...courses]
			// Dangers
			recalculateDangers()
			addToast({
				message: 'Se ha eliminado la sección exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Sections
	async function newSection() {
		try {
			if (section === '' || section.length > 100)
				throw new Error('Debe existir una sección con máx. 100 cárac.')
			const index = positionCourse
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/course/new_section/${courses[index]._id}`,
				{ section },
				true,
				undefined,
				token,
			)
			// New values
			section = ''
			courses[index].sections = [dataFetch.body.section, ...courses[index].sections]
			addToast({
				message: 'Se ha agregado la sección exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function addTeacher(e: KeyboardEvent, index: number) {
		const target = e.target as HTMLInputElement
		const indexC = positionCourse
		try {
			await API.fetchData(
				'post',
				`${variables.API}/api/course/add_teacher_section/${target.value}/${target.dataset.id}`,
				undefined,
				true,
				undefined,
				token,
			)
			courses[indexC].sections[index].header_teacher = target.value
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteSection(id: string) {
		try {
			const index = positionCourse
			await API.fetchDeleteData(
				`${variables.API}/api/course/delete_section/${id}`,
				true,
				token,
			)
			// Delete
			courses[index].sections = courses[index].sections.filter((section) => {
				if (section._id !== id) return section
			})
			addToast({
				message: 'Se ha eliminado la sección exitosamente',
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
			clickFunction={toggleCourse}
			title={'Agregar curso'}
			classItem={'fa-solid fa-plus'}
		/>
		<ButtonIcon
			clickFunction={toggleCycle}
			title={'Ciclos'}
			classItem={'fa-solid fa-network-wired'}
		/>
		<ButtonIcon
			clickFunction={toggleMap}
			title={'Mapa de cursos'}
			classItem={'fa-solid fa-diagram-next'}
		/>
	</Icons>
	<h2>Cursos</h2>
	<br />
	{#if courses}
		{#if first}
			<span class="Danger">* No existe el primer grado</span>
		{/if}
		{#if consecutive}
			<span class="Danger">* No son consecutivos los niveles/grados</span>
		{/if}
		{#if final}
			<span class="Danger">* No existe final de nivel/grado</span>
		{/if}
		<Table header={['Curso', 'Ciclo', 'Nivel/Grado', 'Secciones', 'Final', '']}>
			{#each courses as course, i}
				<tr>
					<td>{course.course}</td>
					<td>{course.cycle.cycle}</td>
					<td>{course.level}°</td>
					<td>
						<ButtonIcon
							clickFunction={() => {
								toggleSections(i)
							}}
							classItem={'fa-solid fa-cubes'}
						/>
					</td>
					<td>{course.isFinal ? 'Final' : 'No'}</td>
					<td>
						<Button
							click={() => {
								courseEdit = Object.assign({}, course)
								courseEdit.isFinal = courseEdit.isFinal ? 'true' : 'false'
								toggleEdit(i)
							}}
							type={'button'}
						>
							<i class="fa-solid fa-pen-to-square White" />
						</Button>
					</td>
				</tr>
			{:else}
				<td>No existen datos...</td>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

<!-- Modals -->
{#if modalCycle}
	<Modal onClose={toggleCycle}>
		<h2 slot="title">Ciclos</h2>
		<h3>Agregar ciclo</h3>
		<Form form={newCycle}>
			<label for="level">Ciclo</label>
			<Input bind:value={cycle} id={'level'} />
			<Button type={'submit'}>Agregar ciclo</Button>
		</Form>
		<br />
		<h3>Ciclos</h3>
		{#if cycles}
			<Table header={['Ciclo', '']}>
				{#each cycles as cycle, i}
					<tr>
						<td>{cycle.cycle}</td>
						<td>
							<ButtonIcon
								clickFunction={() => deleteCycle(cycle._id, i)}
								classItem={'fa-solid fa-minus'}
								title={'Eliminar ciclo'}
							/>
						</td>
					</tr>
				{:else}
					<td>No existen datos...</td>
				{/each}
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
	</Modal>
{/if}

{#if modalCourse}
	<Modal onClose={toggleCourse}>
		<h2 slot="title">Agregar curso</h2>
		<Form form={newCourse}>
			<label for="course">Curso</label>
			<Input bind:value={courseForm.course} id={'course'} />
			<label for="cycle">Ciclo</label>
			<Select bind:value={courseForm.cycle} id={'cycle'}>
				<option value="">Seleccione un ciclo</option>
				{#each cycles as cycle}
					<option value={cycle._id}>{cycle.cycle}</option>
				{/each}
			</Select>
			<label for="level">Nivel/Grado</label>
			<Input bind:value={courseForm.level} id={'level'} type={'number'} />
			<Button type={'submit'}>Agregar curso</Button>
		</Form>
	</Modal>
{/if}

{#if modalMap}
	<Modal onClose={toggleMap}>
		<h2 slot="title">Mapa cursos (Nivel/Grados)</h2>
		<section class="Map">
			{#each courses as course, i}
				<MapElement
					sections={course.sections}
					course={course.course}
					grade={course.level}
				/>
				{#if i + 1 !== courses.length}
					<i class="fa-solid fa-arrow-down" />
				{/if}
			{/each}
		</section>
	</Modal>
{/if}

{#if modalEdit}
	<Modal onClose={toggleEdit}>
		<h2 slot="title">Editar curso {courses[positionCourse].course}</h2>
		<Form form={updateCourse}>
			<label for="courseE">Curso</label>
			<Input bind:value={courseEdit.course} id={'courseE'} />
			<label for="cycleE">Ciclo</label>
			<Select bind:value={courseEdit.cycle._id} id={'cycleE'}>
				{#each cycles as cycle}
					<option value={cycle._id}>{cycle.cycle}</option>
				{/each}
			</Select>
			<label for="levelE">Nivel/Grado</label>
			<Input bind:value={courseEdit.level} id={'levelE'} type={'number'} />
			<label for="final">Final</label>
			<Select bind:value={courseEdit.isFinal} id={'final'}>
				<option value="false">No, no es final</option>
				<option value="true">Sí, es final</option>
			</Select>
			<Button type={'submit'}>Editar curso</Button>
			<button
				type={'button'}
				on:click={() => deleteCourse(courseEdit._id)}
				class="Form__button Down"><i class="fa-solid fa-trash-can" /> Eliminar curso</button
			>
		</Form>
	</Modal>
{/if}

{#if modalSections}
	<Modal onClose={toggleSections}>
		<h2 slot="title">Secciones {courses[positionCourse].course}</h2>
		<Form form={newSection}>
			<label for="section">Nombre secci&oacute;n</label>
			<Input bind:value={section} id={'section'} />
			<Button type={'submit'}>Agregar secci&oacute;n</Button>
		</Form>
		<br />
		<Table header={['Sección', 'Profesor jefe', '']}>
			{#each courses[positionCourse].sections as section, i}
				<tr>
					<td>{section.section}</td>
					<td>
						<Select
							dataId={section._id}
							change={(e) => addTeacher(e, i)}
							value={section?.header_teacher}
							id={'teacher'}
						>
							<option value="">Sin asignar</option>
							{#each teachers as teacher}
								<option value={teacher._id}
									>{teacher.user.name} {teacher.user.first_lastname}</option
								>
							{/each}
						</Select>
					</td>
					<td>
						<ButtonIcon
							title={'Eliminar sección'}
							clickFunction={() => {
								deleteSection(section._id)
							}}
							classItem={'fa-solid fa-minus'}
						/>
					</td>
				</tr>
			{:else}
				<td>No hay datos...</td>
			{/each}
		</Table>
	</Modal>
{/if}

<style lang="scss">
	.White {
		color: white;
	}

	.Danger {
		color: var(--color-danger);
		margin-bottom: 20px;
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

	.Map {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.Map i {
		color: var(--color-main);
		font-size: 1.3rem;
	}

	h3 {
		margin-bottom: 10px;
	}
</style>
