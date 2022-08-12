<script lang="ts">
	import { goto } from '$app/navigation'

	import AIcon from '$components/HTML/AIcon.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'

	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'
	import type { StudentAccess } from '$models/classroom/students_access.model'
	import type { Work } from '$models/classroom/work.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import downloadFileURL from '$utils/downloadFileURL'
	import { formatDate } from '$utils/format'

	export let students: Array<StudentAccess>
	export let work: Work
	export let idWork: string
	export let totalPoints: number
	export let token: string
	export let formHasPoints: boolean

	// Modal
	let modal = false
	const toggleModal = () => (modal = !modal)
	// Set evaluate files
	let studentE: StudentAccess
	let index = 0
	let evaluateFiles: any = {}

	function initEvaluateFiles() {
		work.pattern.forEach((item) => {
			evaluateFiles[item._id] = ''
		})
	}

	if (work.type === 'files') initEvaluateFiles()
	// Headers
	let header: Array<string>

	function getStudentStatusForm(student: StudentAccess) {
		if (!student.access) return 'Sin abrir formulario'
		if (student.access.status === 'opened') return 'Formulario en resolución'
		if (student.access.status === 'finished') return 'Formulario finalizado'
		if (student.access.status === 'revised') return 'Formulario evaluado/revisado'
	}
	// Set headers
	const now = new Date().getTime()
	header = ['Estudiante', 'RUT']
	if (work.type === 'form') {
		header.push('Acceso')
		if (new Date(work.date_limit).getTime() < now && formHasPoints)
			header.push('Evaluado (%)', 'Puntaje', work.is_revised ? 'Reevaluar' : 'Evaluar')
		if (!formHasPoints) header.push('Ver respuestas')
	} else if (work.type === 'files') {
		header.push('Estado')
		if (new Date(work.date_limit).getTime() < now) {
			header.push(
				'<i class="fa-solid fa-file-arrow-up"></i> Archivos',
				'Fecha de Subida',
				'Puntaje',
				work.is_revised ? 'Reevaluar' : 'Evaluar',
			)
		}
	}

	async function grade() {
		try {
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/grade_form/${idWork}`,
				undefined,
				true,
				undefined,
				token,
			)
			goto('../trabajos')
			addToast({
				message: 'Se ha evaluado el trabajo exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function gradeFiles() {
		try {
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/grade_files/${idWork}`,
				undefined,
				true,
				undefined,
				token,
			)
			goto('../trabajos')
			addToast({
				message: 'Se ha evaluado el trabajo exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function getStudentStatusFiles(student: StudentAccess) {
		if (!student.files_uploaded) return 'Sin entrega de archivos'
		return 'Archivos entregados'
	}

	async function downloadFiles(idStudent: string, index: number) {
		try {
			const dataFetch: any = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/works/download_files_work_student/${work._id}/${idStudent}`,
				true,
				token,
				{
					responseType: 'arraybuffer',
					headers: {
						'content-type': 'application/json',
					},
				},
			)
			const blob = new Blob([dataFetch], { type: 'application/octet-stream' })
			const url = window.URL.createObjectURL(blob)
			const studentName = `${students[index].user.rut} ${students[index].user.name} ${students[index].user.first_lastname}`
			downloadFileURL(url, `${studentName}.zip`)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function uploadEvaluateFiles() {
		try {
			const data = []
			for (const idPattern in evaluateFiles) {
				data.push({
					pattern: idPattern,
					points: parseInt(evaluateFiles[idPattern]),
				})
			}
			const studentId = studentE.user._id
			const route = !work.is_revised ? 'upload_evaluate_files' : 'upload_reevaluate_files'
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/${route}/${work._id}/${studentId}`,
				data,
				true,
				undefined,
				token,
			)
			// Set new values
			students[index].files_uploaded.evaluate = data
			addToast({
				message: 'Se ha evaluado al alumno exitosamente',
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

<Table {header}>
	{#each students as student, i}
		<tr>
			<td>
				{student.user.name}
				{student.user.first_lastname}
				{student.user.second_lastname}
			</td>
			<td>{student.user.rut}</td>
			<td
				>{work.type === 'form'
					? getStudentStatusForm(student)
					: getStudentStatusFiles(student)}</td
			>
			{#if new Date(work.date_limit).getTime() < now}
				{#if work.type === 'form'}
					{#if formHasPoints}
						<td>
							{@html student.access && student.evaluate.percentage !== 100
								? '<i style="color: var(--color-warning);" title="Por evaluar" class="fa-solid fa-circle-exclamation"></i>'
								: ''}
							{student.access ? student?.evaluate?.percentage : '100'}%
						</td>
						<td
							>{student.access
								? student?.evaluate?.points_total
								: '0'}/{totalPoints}</td
						>
						<td>
							{#if student.access}
								<AIcon
									href={`/aula_virtual/formulario/${idWork}/estudiante/${student.user._id}`}
									target={'_blank'}
									title={'Evaluar formulario'}
									classItem={'fa-solid fa-pencil'}
								/>
							{:else}
								<i class="fa-solid fa-ban" />
							{/if}
						</td>
					{:else}
						<td
							><AIcon
								target={'_blank'}
								href={`/aula_virtual/formulario/${idWork}/estudiante/${student.user._id}`}
								classItem={'fa-solid fa-r'}
							/></td
						>
					{/if}
				{:else if work.type === 'files' && new Date(work.date_limit).getTime() < now}
					{#if student.files_uploaded}
						<td>
							<Button click={() => downloadFiles(student.user._id, i)} type="button">
								<i class="fa-solid fa-file-arrow-down" />
							</Button>
						</td>
					{:else}
						<td><i class="fa-solid fa-ban" /></td>
					{/if}
					<td
						class={new Date(student.files_uploaded.date).getTime() <
						new Date(work.date_limit).getTime()
							? 'Success'
							: 'Fail'}
					>
						{formatDate(student.files_uploaded.date)}
						{new Date(student.files_uploaded.date).getTime() <
						new Date(work.date_limit).getTime()
							? '(A tiempo)'
							: '(Atrasado)'}
					</td>
					<td>
						{student?.files_uploaded?.evaluate
							? student.files_uploaded.evaluate.reduce((a, b) => {
									return a + b.points
							  }, 0)
							: '0'}/{totalPoints}
					</td>
					{#if student.files_uploaded}
						<td>
							<ButtonIcon
								title={'Evaluar archivos'}
								classItem={'fa-solid fa-pencil'}
								clickFunction={() => {
									studentE = student
									index = i
									// Init evaluate struct
									initEvaluateFiles()
									student.files_uploaded?.evaluate?.forEach((evaluate) => {
										evaluateFiles[evaluate.pattern] = evaluate.points
									})
									toggleModal()
								}}
							/>
						</td>
					{:else}
						<td><i class="fa-solid fa-ban" /></td>
					{/if}
				{/if}
			{/if}
		</tr>
	{/each}
</Table>

{#if new Date(work.date_limit).getTime() < now}
	{#if work.is_revised}
		<span><i class="fa-solid fa-circle-check" /> Trabajo revisado</span>
	{:else if formHasPoints || work.type === 'files'}
		<footer class="Button">
			<Button
				click={() => {
					if (work.type === 'files') {
						gradeFiles()
					} else {
						grade()
					}
				}}
				type={'button'}><i class="fa-solid fa-clipboard-check" /> Calificar</Button
			>
		</footer>
	{/if}
{/if}

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Evaluar {studentE.user.name} {studentE.user.first_lastname}</h2>
		<Form form={uploadEvaluateFiles}>
			<Table header={['Titulo', 'Descr.', 'Pts. Máx', 'Pts. Evaluados']}>
				{#each work.pattern as item}
					<tr>
						<td>{item.title}</td>
						<td>{item.description}</td>
						<td>{item.points}</td>
						<td>
							<Input type={'number'} bind:value={evaluateFiles[item._id]} />
						</td>
					</tr>
				{/each}
			</Table>
			<Button type="submit">
				{#if !work.is_revised}
					Evaluar alumno
				{:else}
					Reevaluar alumno
				{/if}
			</Button>
		</Form>
	</Modal>
{/if}

<style lang="scss">
	.Button {
		width: fit-content;
		i {
			color: white;
		}
	}

	span {
		color: var(--color-main);
		font-weight: bold;
		i {
			color: var(--color-main);
		}
	}

	i {
		color: white;
	}

	.Success {
		color: var(--color-main);
	}

	.Fail {
		color: var(--color-danger);
	}
</style>
