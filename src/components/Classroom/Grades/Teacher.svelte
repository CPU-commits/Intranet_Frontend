<script lang="ts">
	export let token: string
	export let name: string
	export let idModule: string
	export let gradePrograms: Array<GradeProgram>

	import Icons from '$components/Admin/Icons.svelte'
	import Modal from '$components/Modal.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Button from '$components/HTML/Button.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Input from '$components/HTML/Input.svelte'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import type { GradeProgram } from '$models/classroom/grade.model'
	import Table from '$components/HTML/Table.svelte'
	import { onMount } from 'svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import type { GradeSee, StudentGrade } from '$models/classroom/student_grade.model'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	import { formatDate } from '$utils/format'
	import type { User } from '$models/users/users.model'
	import downloadFileURL from '$utils/downloadFileURL'

	// Modal
	let modalProgramGrades = false
	let modalSeePrograms = false
	let modalGrade = false
	let modalAddGrade = false
	const toggleModalPG = () => (modalProgramGrades = !modalProgramGrades)
	const toggleModalSeeP = () => (modalSeePrograms = !modalSeePrograms)
	const toggleGrade = () => (modalGrade = !modalGrade)
	const toggleAddGrade = () => (modalAddGrade = !modalAddGrade)

	type Acumulative = {
		percentage: string
		number?: number
	}

	let program = {
		number: '',
		percentage: '',
		is_acumulative: 'false',
		acumulative: [] as Acumulative[],
	}
	let gradeAdd: string
	let students: Array<StudentGrade>
	let gradeSee: GradeSee
	let studentSee: User
	let gradeAcumulative: Array<string>
	let programIndex: number
	let studentIndex: number

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/grades/get_students_grades/${idModule}`,
				false,
				token,
			)
			students = dataFetch.body.students
		} catch (err) {
			students = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function addAcumulative() {
		program.acumulative = [
			...program.acumulative,
			{
				percentage: '',
			},
		]
	}

	function deleteAcumulative(index: number) {
		program.acumulative.splice(index, 1)
		program.acumulative = program.acumulative
	}

	function validateNumber(number: string, index?: number) {
		if (number === '')
			throw new Error(
				`Indique un porcentaje para la calificación ${
					index ? 'acumulativa ' + index + '°' : ''
				}`,
			)
		if (parseInt(number) <= 0 || Number.isInteger(number))
			throw new Error(
				`El porcentaje ${
					index ? 'de la calificación acumulativa ' + index + '°' : ''
				} debe ser entero y mayor a cero`,
			)
	}

	function validatorsProgram() {
		if (program.number === '') throw new Error('Seleccione un número de calificación')
		validateNumber(program.percentage)
		if (program.is_acumulative === 'true') {
			if (program.acumulative.length < 2)
				throw new Error('Deben existir mín. 2 calificaciones acumulativas')
			program.acumulative.forEach((acumulative, i) => {
				validateNumber(acumulative.percentage, i + 1)
			})
		}
	}

	async function uploadProgram() {
		try {
			validatorsProgram()
			const data = {
				number: parseInt(program.number),
				percentage: parseInt(program.percentage),
				is_acumulative: program.is_acumulative === 'true',
				acumulative: program.acumulative.map((ac, i) => {
					return {
						percentage: parseInt(ac.percentage),
						number: i + 1,
					}
				}),
			}
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/grades/upload_program/${idModule}`,
				data,
				true,
				undefined,
				token,
			)
			gradePrograms = [
				...gradePrograms,
				{
					...data,
					_id: dataFetch.body._id,
				},
			]
			addToast({
				message: 'Se ha subido exitosamente la programación',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteProgram(idProgram: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/grades/delete_program/${idModule}/${idProgram}`,
				true,
				token,
			)
			gradePrograms = gradePrograms.filter((program) => {
				if (program._id !== idProgram) return program
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	// Grade
	async function addGrade(acumulative?: string) {
		try {
			const index = programIndex
			let indexAcumulative: number
			let data: { grade?: number; program: string; acumulative?: string } = {
				program: gradePrograms[index]._id,
			}
			if (!acumulative) {
				if (gradeAdd === '') throw new Error('Se necesita una calificación')
				data.grade = parseFloat(gradeAdd)
			} else {
				indexAcumulative = gradePrograms[index].acumulative.findIndex((a) => {
					return a._id === acumulative
				})
				if (gradeAcumulative[indexAcumulative] === '')
					throw new Error('Se necesita una calificación')
				data.grade = parseFloat(gradeAcumulative[indexAcumulative])
				data.acumulative = acumulative
			}
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/grades/upload_grade/${idModule}/${studentSee._id}`,
				data,
				true,
				undefined,
				token,
			)

			let grade: number
			if (!acumulative) {
				grade = data.grade
			} else {
				grade = gradeSee?.grade ? gradeSee.grade : 0
				grade +=
					(data.grade * gradePrograms[index].acumulative[indexAcumulative].percentage) /
					100
			}
			students[studentIndex].grades[index] = {
				...students[studentIndex].grades[index],
				is_acumulative: gradePrograms[index].is_acumulative,
				grade,
			}
			if (!acumulative) {
				students[studentIndex].grades[index] = {
					...students[studentIndex].grades[index],
					_id: dataFetch.body._id,
					grade: data.grade,
					date: new Date().toISOString(),
					evaluator: {
						name,
						first_lastname: '',
					},
				}
			} else {
				if (!students[studentIndex].grades[index].acumulative)
					students[studentIndex].grades[index].acumulative = []
				students[studentIndex].grades[index].acumulative[indexAcumulative] = {
					_id: dataFetch.body._id,
					grade: data.grade,
					evaluator: {
						name,
						first_lastname: '',
					},
					date: new Date().toISOString(),
				}
				gradeSee = students[studentIndex].grades[index]
			}
			modalAddGrade = false
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function updateGrade(isAcumulative: boolean, index?: number) {
		try {
			let grade: string
			let gradeId: string
			if (!isAcumulative) {
				grade = gradeSee.grade.toString()
				gradeId = gradeSee._id
			} else {
				grade = gradeSee.acumulative[index].grade.toString()
				gradeId = gradeSee.acumulative[index]._id
			}
			await API.fetchData(
				'put',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/grades/update_grade/${idModule}/${gradeId}`,
				{
					grade: parseFloat(grade),
				},
				true,
				undefined,
				token,
			)
			if (!isAcumulative) {
				students[studentIndex].grades[programIndex].grade = parseFloat(grade)
			} else {
				students[studentIndex].grades[programIndex].acumulative[index].grade =
					parseFloat(grade)
				const grades = students[studentIndex].grades[programIndex].acumulative
				students[studentIndex].grades[programIndex].grade = grades.reduce((a, grade, i) => {
					if (grade)
						return (
							a +
							(grade.grade * gradePrograms[programIndex].acumulative[i].percentage) /
								100
						)
				}, 0)
			}
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function exportGrades() {
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
			downloadFileURL(url, `hola.xlsx`)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="Grades">
	<header>
		<Icons>
			<ButtonIcon
				title={'Programar calificaciones'}
				clickFunction={toggleModalPG}
				classItem={'fa-solid fa-flag'}
			/>
			<ButtonIcon
				title={'Ver programación calificaciones'}
				clickFunction={toggleModalSeeP}
				classItem={'fa-solid fa-chart-pie'}
			/>
			<ButtonIcon
				title={'Exportar Excel Con calificaciones'}
				clickFunction={exportGrades}
				classItem={'fa-solid fa-file-export'}
			/>
		</Icons>
	</header>
	<h2>Calificaciones</h2>
	{#if gradePrograms && students}
		<Table
			header={[
				'Estudiante',
				...gradePrograms.map((program) => {
					return `${program.number}° (${program.percentage}%)`
				}),
				'Prom. Total',
			]}
		>
			{#if students}
				{#each students as student, i}
					<tr>
						<td>
							{student.student.rut}
							{student.student.name}
							{student.student.first_lastname}
						</td>
						{#each student.grades as grade, j}
							<td>
								{#if grade || gradePrograms[j].is_acumulative}
									<ButtonText
										click={() => {
											toggleGrade()
											programIndex = j
											if (grade) gradeSee = grade
											studentSee = student.student
											studentIndex = i
											if (gradePrograms[j].is_acumulative)
												gradeAcumulative = Array(
													gradePrograms[j].acumulative.length,
												)
										}}
										>{grade?.grade ? grade.grade : 'N/A'}
									</ButtonText>
								{:else}
									<ButtonText
										click={() => {
											toggleAddGrade()
											gradeAdd = ''
											programIndex = j
											studentIndex = i
											gradeSee = grade
											studentSee = student.student
										}}
									>
										N/A
									</ButtonText>
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
			{:else}
				<SpinnerGet />
			{/if}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</section>

{#if modalProgramGrades}
	<Modal onClose={toggleModalPG}>
		<h2 slot="title">Programar calificaci&oacute;n</h2>
		<Form form={uploadProgram}>
			<label for="number">Calificaci&oacute;n n°</label>
			<Select bind:value={program.number} id={'number'}>
				<option value="">Seleccione una opci&oacute;n</option>
				{#each Array(30) as _, i}
					<option value={i + 1}>{i + 1}°</option>
				{/each}
			</Select>
			<label for="percentage">Porcentaje calificaci&oacute;n</label>
			<Input id={'percentage'} bind:value={program.percentage} type={'number'} />
			<label for="is_acumulative">Tipo de calificaci&oacute;n</label>
			<Select id={'is_acumulative'} bind:value={program.is_acumulative}>
				<option value="false">Calificaci&oacute;n directa</option>
				<option value="true">Acumulativa</option>
			</Select>
			{#if program.is_acumulative === 'true'}
				<h3>Calificaciones acumulativas</h3>
				{#each program.acumulative as acumulative, i}
					<div class="Inline">
						<span>{i + 1})</span>
						<Input
							placeholder={`Porcentaje calificación ${i + 1}°`}
							bind:value={acumulative.percentage}
						/>
						<ButtonIcon
							classItem={'fa-solid fa-circle-minus'}
							clickFunction={() => deleteAcumulative(i)}
						/>
					</div>
				{/each}
				<ButtonIcon
					classItem={'fa-solid fa-plus'}
					clickFunction={addAcumulative}
					title={'Agregar calificación acumulativa'}
				/>
			{/if}
			<Button type={'submit'}>Subir programaci&oacute;n</Button>
		</Form>
	</Modal>
{/if}

{#if modalSeePrograms}
	<Modal onClose={toggleModalSeeP}>
		<h2 slot="title">Programas de calificaciones</h2>
		<Table header={['N°', 'Porcentaje', 'Acumulativo', '']}>
			{#each gradePrograms as program}
				<tr>
					<td>{program.number}</td>
					<td>{program.percentage}%</td>
					<td>
						{!program.is_acumulative
							? 'No aplica'
							: program.acumulative
									.map(
										(acumulative) =>
											`${acumulative.number}°[${acumulative.percentage}%] `,
									)
									.join('')}
					</td>
					<td
						><ButtonIcon
							hover={'var(--color-danger)'}
							clickFunction={() => deleteProgram(program._id)}
							title={'Eliminar programación'}
							classItem={'fa-solid fa-circle-minus'}
						/></td
					>
				</tr>
			{:else}
				<span>Todav&iacute;a ninguna programaci&oacute;n</span>
			{/each}
		</Table>
	</Modal>
{/if}

{#if modalGrade}
	<Modal onClose={toggleGrade}>
		<h2 slot="title">
			Calificaci&oacute;n {gradePrograms[programIndex].number}° ({gradePrograms[programIndex]
				.percentage}%)
		</h2>
		{#if gradePrograms[programIndex].is_acumulative}
			<h3>Acumulativa:</h3>
			{#each gradePrograms[programIndex].acumulative as program, i}
				<h4>Acumulativa {program.number}° ({program.percentage}%)</h4>
				{#if gradeSee?.acumulative[i]}
					<Form form={() => updateGrade(true, i)}>
						<Input bind:value={gradeSee.acumulative[i].grade} />
						<Button type="submit">Editar calificaci&oacute;n</Button>
						<footer class="Info">
							<small>
								Evaluado por
								<span class="Evaluator">
									{gradeSee.acumulative[i].evaluator.name}
									{gradeSee.acumulative[i].evaluator.first_lastname}
								</span>
							</small>
							<small>{formatDate(gradeSee.acumulative[i].date)}</small>
						</footer>
					</Form>
				{:else}
					<Form form={() => addGrade(program._id)}>
						<Input bind:value={gradeAcumulative[i]} />
						<Button type="submit">Subir calificaci&oacute;n</Button>
					</Form>
				{/if}
				<br />
			{/each}
		{:else}
			<Form form={() => updateGrade(false)}>
				<label for="grade">Calificaci&oacute;n</label>
				<Input bind:value={gradeSee.grade} />
				<Button type="submit">Editar calificaci&oacute;n</Button>
			</Form>
			<footer class="Info">
				<small>
					Evaluado por
					<span class="Evaluator">
						{gradeSee.evaluator.name}
						{gradeSee.evaluator.first_lastname}
					</span>
				</small>
				<small>{formatDate(gradeSee.date)}</small>
			</footer>
		{/if}
	</Modal>
{/if}

{#if modalAddGrade}
	<Modal onClose={toggleAddGrade}>
		<h2 slot="title">Agregar calificaci&oacute;n</h2>
		<Form form={() => addGrade()}>
			<label for="grade">Calificaci&oacute;n</label>
			<Input type={'number'} bind:value={gradeAdd} />
			<Button type="submit">Subir calificaci&oacute;n</Button>
		</Form>
	</Modal>
{/if}

<style>
	header {
		border: 2px solid var(--color-main);
		padding: 8px;
		margin-bottom: 10px;
	}

	.Inline {
		display: flex;
		gap: 5px;
		align-items: center;
	}

	.Info {
		display: flex;
		margin-top: 20px;
		justify-content: space-between;
		align-items: center;
	}

	.Evaluator {
		color: var(--color-main);
	}
</style>
