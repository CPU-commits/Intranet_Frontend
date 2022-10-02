<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		finish_semester: FinishSemester
	}

	// Types
	import type { Session } from '$models/session.model'
	import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
	import type { Semester } from '$models/admin/semester.model'
	import type { Course, Section } from '$models/admin/courses.model'
	import type { Student } from '$models/admin/student.model'
	type FinishSemester = {
		close_date_semester: Date | null
		semester_status: {
			value: 'ending' | 'working'
		}
	}
	// Svelte
	import { goto } from '$app/navigation'
	// Components
	import Panel from '$components/Admin/Panel.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import Error from '$components/Error.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Checkbox from '$components/HTML/Checkbox.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import { addToast } from '$stores/toasts'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Button from '$components/HTML/Button.svelte'
	import { formatDate } from '$utils/format'

	// Init variables
	let token = data.user.token
	// Promises
	let promiseSemester: Promise<Semester> = getCurrentSemester()
	let promiseCourses: Promise<Array<Course>> = getCourses()
	let promiseVariableSections: Promise<Array<any>> = getVariableSections()

	async function getCurrentSemester() {
		const dataFetch: FetchResponse<{ semester: Semester }> = await API.fetchGetData(
			`${variables.API}/api/semesters/get_current_semester`,
			false,
			token,
		)
		return dataFetch.body.semester
	}

	async function getCourses() {
		try {
			const dataFetch: FetchResponse<{ courses: Array<Course> }> = await API.fetchGetData(
				`${variables.API}/api/course/get_courses`,
				false,
				token,
			)
			const coursesWithoutVariableSections = dataFetch.body.courses.map((course) => {
				return {
					...course,
					sections: course.sections.filter((section) => {
						if (!section.is_next_section_variable) return section
					}),
				}
			})

			students = new Array(coursesWithoutVariableSections.length)
			courses = coursesWithoutVariableSections
			return coursesWithoutVariableSections
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function getVariableSections() {
		try {
			const dataFetch: FetchResponse<{ sections: Array<Section> }> = await API.fetchGetData(
				`${variables.API}/api/course/get_variable_sections`,
				false,
				token,
			)
			studentsVariable = new Array(dataFetch.body.sections.length)
			return dataFetch.body.sections
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	// Data
	let finishSemester: FinishSemester = data.finish_semester
	let courses: Array<Course>
	// Students
	let students: { student: Student; repeat: boolean }[][]
	let studentsVariable: {
		student: Student
		id_next_section: string
	}[][]

	async function getStudentsFromCourse(idCourse: string, index: number, isVariable = false) {
		try {
			if (!students[index]) {
				const dataFetch: FetchResponse<Array<Student>> = await API.fetchGetData(
					`${variables.API}/api/students/get_students_course/${idCourse}`,
					true,
					token,
				)
				if (!isVariable) {
					students[index] = dataFetch.body.map((student) => {
						return {
							student,
							repeat: false,
						}
					})
				} else {
					studentsVariable[index] = dataFetch.body.map((student) => {
						return {
							student,
							id_next_section: '',
						}
					})
				}
			}
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function getNextSectionsCourse(courses: Course[], level: number): Section[] {
		let nextCourse: Course
		const sections = courses
			.filter((course) => course.level + 1 === level)
			.map((course) => {
				nextCourse = course
				return course.sections
			})
			.flat()
			.map((section) => {
				return {
					...section,
					course: nextCourse,
				}
			})
		return sections
	}

	function countAfterCourses(index: number, courses: Array<Course>) {
		let counter = 0
		for (let i = 0; i < index; i++) {
			counter += courses[i].sections.length
		}
		return counter
	}

	async function interruptFinishSemester() {
		try {
			await API.fetchData(
				'put',
				`${variables.API}/api/semesters/interrupt_finish_Semester`,
				undefined,
				true,
				undefined,
				token,
			)
			goto('/admin/semestres')
			addToast({
				message: 'Se ha interrumpido exitosamente la finalización del semestre',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function finishCurrentSemester() {
		try {
			// Data
			const studentsRepeat = students
				.flat()
				.filter((student) => {
					if (student.repeat) return student
				})
				.map((student) => {
					return student.student._id
				})
			const studentsNextCourses = studentsVariable
				.flat()
				.filter((student) => {
					if (student.id_next_section === 'repeat') {
						studentsRepeat.push(student.student._id)
					} else {
						return student
					}
				})
				.map((student) => {
					return {
						...student,
						student: student.student._id,
					}
				})
			const data = {} as {
				students_repeat: Array<string>
				students_next_courses: Array<{
					student: string
					id_next_section: string
				}>
			}
			if (studentsRepeat?.length > 0) data.students_repeat = studentsRepeat
			if (studentsNextCourses?.length > 0) data.students_next_courses = studentsNextCourses
			// Fecth
			await API.fetchData(
				'put',
				`${variables.API}/api/semesters/finish_semester`,
				data,
				true,
				undefined,
				token,
			)
			goto('/admin/semestres')
			addToast({
				message: 'Se ha finalizado el semestre exitosamente',
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
	<h2>Finalizar semestre</h2>
	<br />
	{#await promiseSemester}
		<SpinnerGet />
	{:then semester}
		{#if semester}
			<h3>Semestre {semester.year} {semester.semester} °</h3>
			<br />
			{#if finishSemester.semester_status.value === 'working'}
				<Form form={finishCurrentSemester}>
					{#if semester.semester === 2}
						<h3><i class="fa-solid fa-repeat" /> Alumnos que repiten curso</h3>
						{#await promiseCourses}
							<SpinnerGet />
						{:then courses}
							{#each courses as course, i}
								{#each course.sections as section, j}
									<h4>
										{course.course}
										{section.section}
										<div>
											<ButtonIcon
												clickFunction={() => {
													getStudentsFromCourse(
														section._id,
														countAfterCourses(i, courses) + j,
													)
												}}
												classItem={'fa-solid fa-caret-down'}
											/>
										</div>
									</h4>
									<section>
										{#if students && students[countAfterCourses(i, courses) + j]}
											<Table header={['Estudiante', 'RUT', 'Repite']}>
												{#each students[countAfterCourses(i, courses) + j] as student}
													<tr>
														<td>
															{student.student.name}
															{student.student.first_lastname}
															{student.student.second_lastname}
														</td>
														<td>{student.student.rut}</td>
														<td>
															<Checkbox
																bind:checked={student.repeat}
																id={student.student._id}
															/>
														</td>
													</tr>
												{/each}
											</Table>
										{/if}
									</section>
								{/each}
							{/each}
						{:catch err}
							<Error {err} />
						{/await}
						<h3><i class="fa-solid fa-arrows-turn-to-dots" /> Cursos variables</h3>
						{#await promiseVariableSections}
							<SpinnerGet />
						{:then variableSections}
							{#each variableSections as section, i}
								<h4>
									{section.course.course}
									{section.section}
									<div>
										<ButtonIcon
											clickFunction={() =>
												getStudentsFromCourse(section._id, i, true)}
											classItem={'fa-solid fa-caret-down'}
										/>
									</div>
								</h4>
								<section>
									{#if studentsVariable && studentsVariable[i]}
										<Table
											header={[
												'Estudiante',
												'RUT',
												'Siguiente curso - sección',
											]}
										>
											{#each studentsVariable[i] as student, j}
												<tr>
													<td>
														{student.student.name}
														{student.student.first_lastname}
														{student.student.second_lastname}
													</td>
													<td>{student.student.rut}</td>
													<td>
														<Select
															bind:value={studentsVariable[i][j]
																.id_next_section}
															id={'next_sections'}
														>
															<option value=""
																>Seleccione una siguiente
																secci&oacute;n</option
															>
															<option value="repeat">Repite</option>
															{#each getNextSectionsCourse(courses, section.course.level) as _section}
																<option value={section._id}>
																	{section.course.course}
																	{section.section}
																</option>
															{/each}
														</Select>
													</td>
												</tr>
											{/each}
										</Table>
									{/if}
								</section>
							{/each}
						{:catch err}
							<Error {err} />
						{/await}
					{/if}
					<span
						>* Tendr&aacute; hasta tres d&iacute;as para cancelar esta acci&oacute;n</span
					>
					<Button type={'submit'}>Finalizar semestre</Button>
				</Form>
			{:else}
				<span>Semestre en proceso de finalizar</span>
				<span
					>Fecha de finalizaci&oacute;n: {formatDate(
						finishSemester.close_date_semester,
					)}</span
				>
				<br />
				<Button click={interruptFinishSemester} type={'submit'}>
					<i class="fa-solid fa-rectangle-xmark close" />
					Interrumpir proceso de finalizaci&oacute;n de semestre
				</Button>
			{/if}
		{:else}
			<span>No existe semestre vigente</span>
		{/if}
	{:catch err}
		<Error {err} />
	{/await}
</Panel>

<style>
	i {
		color: var(--color-main);
	}

	h4 {
		display: flex;
		align-items: center;
		gap: 5px;
	}
</style>
