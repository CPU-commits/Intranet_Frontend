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
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { GradeProgram } from '$models/classroom/grade.model'
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { StudentGrade } from '$models/classroom/student_grade.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	export let token: string
	// Modals
	let modalGrade = false
	let modalGrades = false
	let modalConfg = false
	const toggleGrade = () => (modalGrade = !modalGrade)
	const toggleGrades = () => (modalGrades = !modalGrades)
	const toggleConfg = () => (modalConfg = !modalConfg)
	// Data
	let gradeConfig = {
		min: '',
		max: '',
	}
	let modules: Array<ClassroomModules>
	// Grades
	let moduleSelected: ClassroomModules
	let grades: Array<StudentGrade>
	let gradePrograms: Array<GradeProgram>

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(`${variables.API}/api/classroom/get_grade_config`, false, token),
				API.fetchGetData(`${variables.API}/api/classroom/get_modules`, false, token),
			])
			gradeConfig = dataFetch[0].body.gradeConfig
			modules = dataFetch[1].body.modules
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getModuleGrades() {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/grades/get_students_grades/${moduleSelected._id}`,
					true,
					token,
				),
				API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/grades/get_grade_programs/${moduleSelected._id}`,
					true,
					token,
				),
			])
			grades = dataFetch[0].body.students
			gradePrograms = dataFetch[1].body.programs
		} catch (err) {
			grades = []
			gradePrograms = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

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
			modules = []
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
	<h2>Aula virtual</h2>
	<br />
	{#if modules}
		<Table header={['Módulo', 'Estado', 'Calificaciones', 'Confg.']}>
			{#each modules as _module}
				<tr>
					<td>
						{_module.section.course.course}
						{_module.section.section}° - {_module.subject.subject}
					</td>
					<td>{!_module.status ? 'Activo' : 'Finalizado'}</td>
					<td>
						<Button
							type={'button'}
							click={() => {
								toggleGrades()
								moduleSelected = _module
								getModuleGrades()
							}}
						>
							<i class="fa-solid fa-highlighter" />
						</Button>
					</td>
					<td>
						<Button type={'button'} click={toggleConfg}>
							<i class="fa-solid fa-gear" />
						</Button>
					</td>
				</tr>
			{:else}
				<tr>
					<td>No hay m&oacute; para este semestre</td>
				</tr>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

{#if modalGrade}
	<Modal onClose={toggleGrade}>
		<h2 slot="title">Configuraci&oacute;n calificaciones</h2>
		<Form form={uploadGrades}>
			<label for="min">Calificaci&oacute;n m&iacute;nima</label>
			<Input id={'min'} bind:value={gradeConfig.min} />
			<label for="max">Calificaci&oacute;n m&aacute;xima</label>
			<Input id={'max'} bind:value={gradeConfig.max} />
			<Button type={'submit'}>Actualizar configuraci&oacute;n</Button>
		</Form>
	</Modal>
{/if}

{#if modalGrades}
	<Modal onClose={toggleGrades}>
		<h2 slot="title">
			Calificaciones
			{moduleSelected.section.course.course}
			{moduleSelected.section.section} ° - {moduleSelected.subject.subject}
		</h2>
		{#if grades}
			<Table
				header={[
					'Estudiante',
					...gradePrograms.map((program) => {
						return `${program.number}° (${program.percentage}%)`
					}),
					'Prom. Total',
				]}
			>
				{#each grades as student, i}
					<tr>
						<td>
							{student.student.rut}
							{student.student.name}
							{student.student.first_lastname}
						</td>
						{#each student.grades as grade, j}
							<td>
								{#if grade || gradePrograms[j].is_acumulative}
									{grade?.grade ? grade.grade : 'N/A'}
								{:else}
									N/A
								{/if}
							</td>
						{/each}
						<td>
							{student.grades
								.reduce((a, grade, i) => {
									if (grade) {
										const percentage = gradePrograms[i].percentage
										return a + (grade.grade * percentage) / 100
									}
								}, 0)
								.toFixed(2)}
						</td>
					</tr>
				{:else}
					<span>No hay estudiantes...</span>
				{/each}
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
	</Modal>
{/if}

{#if modalConfg}
	<Modal onClose={toggleConfg}>
		<h2 slot="title">Configuraci&oacute;n de m&oacute;dulo</h2>
		<Form form={() => {}}>
			<Button type={'submit'}>Actualizar m&oacute;dulo</Button>
		</Form>
	</Modal>
{/if}

<style>
	i {
		color: white;
	}
</style>
