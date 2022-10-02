<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		semesters: Array<{
			semester: Semester
			modules: Array<ClassroomModules>
			students?: {
				students: Array<Student>
				date: string
			}
		}>
	}

	// Types
	import type { Semester } from '$models/admin/semester.model'
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { Session } from '$models/session.model'
	import type { Student } from '$models/admin/student.model'
	import type { GradeProgram } from '$models/classroom/grade.model'
	import type { StudentGrade } from '$models/classroom/student_grade.model'
	// Stores
	import { page } from '$app/stores'
	import { addToast } from '$stores/toasts'
	// Components
	import Panel from '$components/Admin/Panel.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Button from '$components/HTML/Button.svelte'
	import Modal from '$components/Modal.svelte'
	// Utils
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import downloadFileURL from '$utils/downloadFileURL'

	// Init variables
	let year = $page.params.year
	let token = data.user.token

	// Data
	let semesters = data.semesters
	let grades: Array<StudentGrade>
	let program: Array<GradeProgram>
	// Modals
	let modal = false
	const toggleModal = () => (modal = !modal)

	async function getModuleGrades(idModule: string) {
		try {
			const dataFetch = await API.fetchGetData(
				`/API/admin/get_module_grades?module=${idModule}`,
				true,
				token,
			)
			grades = dataFetch.body.grades
			program = dataFetch.body.gradePrograms
			toggleModal()
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function exportGrades(idModule: string) {
		try {
			const dataFetch: any = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/grades/export_grades/${idModule}`,
				true,
				token,
				{
					responseType: 'arraybuffer',
					headers: {
						'content-type': 'application/json',
					},
				},
			)
			const blob = new Blob([dataFetch], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			})
			const url = window.URL.createObjectURL(blob)
			downloadFileURL(url, `calificaciones.xlsx`)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<Panel nav={false}>
	<h2><i class="fa-solid fa-folder-open" /> {year} - Archivado</h2>
	{#each semesters as semester}
		{#if semester.semester}
			<section class="Folder">
				<h3>
					{semester.semester.year} - {semester.semester.semester}° {semester.semester
						.status === 2
						? 'Sin finalizar'
						: ''}
				</h3>
				{#if semester.semester.status === 0}
					<h4><i class="fa-solid fa-box" /> M&oacute;dulos - Aula Virtual</h4>
					<Table header={['Módulo', 'Calificaciones', 'Exportar']}>
						{#each semester.modules as _module}
							<tr>
								<td>
									{_module.section.course.course}
									{_module.section.section} ° - {_module.subject.subject}
								</td>
								<td class="Button">
									<Button
										click={() => getModuleGrades(_module._id)}
										type={'button'}
									>
										<i class="fa-solid fa-highlighter" />
									</Button>
								</td>
								<td class="Button">
									<Button click={() => exportGrades(_module._id)} type={'button'}>
										<i class="fa-solid fa-file-export" />
									</Button>
								</td>
							</tr>
						{/each}
					</Table>
					{#if semester.semester.semester === 2}
						<h4><i class="fa-solid fa-repeat" /> Estudiantes repitentes</h4>
						{#if semester.students?.students}
							<Table header={['Nombre', 'RUT']}>
								{#each semester.students.students as student}
									<tr>
										<td>{student.name} {student.first_lastname}</td>
										<td>{student.rut}</td>
									</tr>
								{:else}
									<tr>
										<td>Sin repitentes</td>
									</tr>
								{/each}
							</Table>
						{/if}
						<small>
							Repitentes totales: {semester.students?.students?.length ?? 0}
						</small>
					{/if}
				{/if}
			</section>
		{/if}
	{/each}
</Panel>

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Calificaciones</h2>
		<Table
			header={[
				'Estudiante',
				...program.map((program) => {
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
							{#if grade || program[j].is_acumulative}
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
									const percentage = program[i].percentage
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
	</Modal>
{/if}

<style>
	.Folder {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		margin-top: 10px;
		border: 1px solid var(--color-light);
	}

	.Button i {
		color: white;
	}
</style>
