<script lang="ts">
	import { goto } from '$app/navigation'

	import AButton from '$components/HTML/AButton.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import InputFiles from '$components/HTML/InputFiles.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'
	import type { FilesUploadedClassroom } from '$models/classroom/files_uploaded.model'
	import type { FormAccess } from '$models/classroom/form_access.model'
	import type { Grade } from '$models/classroom/grade.model'

	import type { Work } from '$models/classroom/work.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { formatDate, formatGrade, secondsToHoursFormat } from '$utils/format'
	import { getIcon } from '$utils/getIcon'
	import FileComponent from '../File.svelte'

	export let work: Work
	export let form_access: FormAccess
	export let files_uploaded: FilesUploadedClassroom
	export let grade: Grade
	export let idModule: string
	export let token: string

	let message: string
	let files: FileList
	let filesStored: Array<File> = []
	// Modal
	let modal = false
	let modalRev = false
	const toggleModal = () => (modal = !modal)
	const toggleModalRev = () => (modalRev = !modalRev)

	if (!form_access) {
		message = 'Abrir formulario'
	} else if (form_access.status === 'opened') {
		message = 'Seguir con el último intento'
	} else if (form_access.status === 'finished') {
		message = 'Revisar respuestas'
	} else if (form_access.status === 'revised') {
		message = 'Ir a la revisión'
	}

	function addList() {
		for (let i = 0; i < files.length; i++) filesStored.push(files[i])
		filesStored = filesStored
	}

	function removeList(index: number) {
		filesStored.splice(index, 1)
		filesStored = filesStored
	}

	async function uploadFiles() {
		try {
			if (filesStored.length === 0)
				throw new Error('Debes seleccionar mín. 1 archivo a subir')
			const form = new FormData()
			filesStored.forEach((file) => {
				form.append('files[]', file)
			})
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/upload_files/${work._id}`,
				form,
				true,
				undefined,
				token,
			)
			goto('../trabajos')
			addToast({
				message: 'Se han subido los archivos exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteFile(id: any) {
		try {
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/delete_file_work/${work._id}/${id}`,
				true,
				token,
			)
			files_uploaded.files_uploaded = files_uploaded.files_uploaded.filter((file) => {
				if (file._id !== id) return file
			})
			addToast({
				message: 'Se ha eliminado el archivo exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function getPointsEvaluated(pattern: string) {
		const index = files_uploaded.evaluate.findIndex((i) => i.pattern === pattern)
		return files_uploaded.evaluate[index].points
	}
</script>

{#if work.type === 'form'}
	{#if work.form_access === 'wtime'}
		<span>Tiempo de acceso una vez abierto: {secondsToHoursFormat(work.time_access)} Hrs.</span>
	{:else}
		<span>Tiempo de acceso una vez abierto: Hasta el cierre del trabajo</span>
	{/if}
	<div class="Form__Button">
		<AButton prefetch={false} href={`/aula_virtual/formulario/${work._id}`}>{message}</AButton>
	</div>
{:else}
	{#if !work.is_revised}
		<h3>Subir archivos</h3>
		<InputFiles multiple={true} onChange={addList} id={'files'} bind:files />
	{/if}
	<section class="Files">
		{#each filesStored as file, i}
			<article class="File">
				<h3><i class={getIcon(file.type)} /> {file.name}</h3>
				<ButtonIcon clickFunction={() => removeList(i)} classItem={'fa-solid fa-xmark'} />
			</article>
		{/each}
		<h4><i class="fa-solid fa-file-arrow-up" /> Archivos subidos</h4>
		<div class="Files">
			{#if files_uploaded}
				{#each files_uploaded.files_uploaded as file}
					<FileComponent
						moduleId={idModule}
						{token}
						edit={!work.is_revised}
						deleteMe={() => deleteFile(file._id)}
						{file}
					/>
				{/each}
			{:else}
				<span>Sin archivos subidos...</span>
			{/if}
		</div>
		{#if files_uploaded}
			<span>
				Fecha de subida:
				<span
					class={new Date(files_uploaded.date) > new Date(work.date_limit)
						? 'Fail'
						: 'Success'}
					>{formatDate(files_uploaded.date)}
				</span>
			</span>
		{/if}
	</section>
	{#if !work.is_revised}
		<div class="Form__Button">
			<Button click={uploadFiles} type="button">Subir archivos</Button>
		</div>
	{/if}
{/if}

{#if work.is_revised}
	<section class="Grade">
		<span>Calificaci&oacute;n final: <span class="Color">{formatGrade(grade.grade)}</span></span
		>
		<small
			>Calificado por: <span class="Color"
				>{grade.evaluator.name} {grade.evaluator.first_lastname}</span
			></small
		>
		<small>Fecha evaluaci&oacute;n: {formatDate(grade.date)}</small>
		{#if work.is_revised}
			<footer class="Revise">
				<Button click={toggleModalRev} type="button">Ver revisi&oacute;n</Button>
			</footer>
		{/if}
	</section>
{/if}

{#if work.type === 'files'}
	<div class="Pattern">
		<ButtonIcon
			clickFunction={toggleModal}
			title={'Rubrica de evaluación'}
			classItem={'fa-solid fa-scroll'}
		/>
		Pauta
	</div>
{/if}

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Pauta</h2>
		<Table header={['Titulo', 'Descr.', 'Pts.']}>
			{#each work.pattern as item}
				<tr>
					<td>{item.title}</td>
					<td>{item.description}</td>
					<td>{item.points}</td>
				</tr>
			{/each}
		</Table>
	</Modal>
{/if}

{#if modalRev}
	<Modal onClose={toggleModalRev}>
		<h2 slot="title">Pauta</h2>
		<Table header={['Titulo', 'Descr.', 'Pts. Máx.', 'Pts. Obtenido']}>
			{#each work.pattern as item}
				<tr>
					<td>{item.title}</td>
					<td>{item.description}</td>
					<td>{item.points}</td>
					<td>
						{getPointsEvaluated(item._id)}
					</td>
				</tr>
			{/each}
		</Table>
	</Modal>
{/if}

<style>
	.Form__Button {
		width: fit-content;
	}

	.Grade {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.Color {
		color: var(--color-main);
		font-weight: bold;
	}

	.Files {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		width: 100%;
	}

	.File {
		display: flex;
		gap: 10px;
	}

	h4 {
		width: 100%;
		padding: 10px;
		text-align: center;
	}

	.Pattern {
		display: flex;
		width: 100%;
		justify-content: flex-start;
		gap: 5px;
	}

	.File i {
		color: var(--color-main);
	}

	.Success {
		color: var(--color-main);
	}

	.Fail {
		color: var(--color-danger);
	}

	.Revise {
		margin-top: 10px;
	}
</style>
