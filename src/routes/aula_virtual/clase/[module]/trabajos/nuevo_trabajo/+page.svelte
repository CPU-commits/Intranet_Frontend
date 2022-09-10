<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { UserForm } from '$models/classroom/form.model'
	import type { GradeProgram } from '$models/classroom/program.model'
	import type { WorkType } from '$models/classroom/work.model'
	import type { Session } from '$models/session.model'
	import type { UserFiles } from '$models/users/files.model'
	// Svelte
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import Attached from '$components/Classroom/Attached.svelte'
	import File from '$components/Classroom/File.svelte'
	import Link from '$components/Classroom/Link.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Table from '$components/HTML/Table.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import { formatDate, formatDateUTC } from '$utils/format'
	import { validateWork } from '$utils/validators'

	// Init variables
	let token = data.user.token
	let idModule = $page.params.module
	// Data
	let gradePrograms: Array<GradeProgram>
	let forms: Array<UserForm>

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/grades/get_grade_programs/${idModule}`,
					false,
					token,
				),
				API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/forms/get_forms`,
					false,
					token,
				),
			])
			gradePrograms = dataFetch[0].body.programs ? dataFetch[0].body.programs : []
			forms = dataFetch[1].body.forms ? dataFetch[1].body.forms : []
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	type Item = {
		title: string
		description: string
		points: number
	}

	let newWork = {
		title: '',
		description: '',
		is_qualified: '',
		grade: '',
		type: '' as keyof typeof WorkType,
		form: '',
		pattern: [] as Item[],
		date_start: '',
		time_start: '',
		date_limit: '',
		time_limit: '',
		form_access: '',
		time_access: '',
	}
	let linksAttached = [] as Array<{
		title: string
		link: string
	}>
	let filesAttached = [] as Array<UserFiles>

	function addItem() {
		newWork.pattern = [
			...newWork.pattern,
			{
				title: '',
				description: '',
				points: 0,
			},
		]
	}

	function deleteItem(index: number) {
		newWork.pattern.splice(index, 1)
		newWork.pattern = newWork.pattern
	}

	function deleteFile(index: number) {
		filesAttached.splice(index, 1)
		filesAttached = filesAttached
	}

	function deleteLink(index: number) {
		linksAttached.splice(index, 1)
		linksAttached = linksAttached
	}

	async function uploadWork() {
		try {
			validateWork(newWork)
			const work: any = {
				title: newWork.title,
				is_qualified: newWork.is_qualified === 'true',
				type: newWork.type,
				date_start: formatDateUTC(new Date(`${newWork.date_start} ${newWork.time_start}`)),
				date_limit: formatDateUTC(new Date(`${newWork.date_limit} ${newWork.time_limit}`)),
			}
			if (newWork.description !== '') work.description = newWork.description
			if (filesAttached.length > 0 || linksAttached.length > 0)
				work.attached = [
					...filesAttached.map((file) => {
						return {
							type: 'file',
							file: file._id.$oid,
						}
					}),
					...linksAttached.map((link) => {
						return {
							type: 'link',
							link: link.link,
							title: link.title,
						}
					}),
				]
			if (newWork.is_qualified === 'true') work.grade = newWork.grade
			if (newWork.type === 'form') {
				work.form = newWork.form
				work.form_access = newWork.form_access === '' ? 'default' : newWork.form_access
				if (work.form_access === 'wtime') {
					const splitTime = newWork.time_access.split(':')
					work.time_access =
						parseInt(splitTime[0]) * 60 ** 2 + parseInt(splitTime[1]) * 60
				}
			}
			if (newWork.type === 'files')
				work.pattern = newWork.pattern.map((item) => {
					return {
						...item,
						points: Number(item.points),
					}
				})
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/upload_work/${idModule}`,
				work,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha publicado el trabajo exitosamente',
				type: 'success',
			})
			goto(`/aula_virtual/clase/${idModule}/trabajos`)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="NewWork">
	<h2>Nuevo trabajo</h2>
	<br />
	<Form form={uploadWork}>
		<label for="title">Titulo trabajo</label>
		<Input bind:value={newWork.title} id={'title'} />
		<label for="">Descripci&oacute;n del trabajo (Opcional)</label>
		<TextArea bind:value={newWork.description} />
		<label for="qualified">Calificaci&oacute;n trabajo</label>
		<Select id={'qualified'} bind:value={newWork.is_qualified}>
			<option value="">Seleccione una opci&oacute;n</option>
			<option value="true">Calificado</option>
			<option value="false">No calificado</option>
		</Select>
		{#if newWork.is_qualified === 'true' && gradePrograms}
			<label for="grade">Calificaci&oacute;n asignada</label>
			<Select id={'grade'} bind:value={newWork.grade}>
				<option value="">Seleccione una opci&oacute;n</option>
				{#each gradePrograms as gradeProgram}
					{#if !gradeProgram.is_acumulative}
						<option value={gradeProgram._id}
							>{gradeProgram.number}° ({gradeProgram.percentage}%)</option
						>
					{:else}
						{#each gradeProgram.acumulative as acumulative}
							<option value={acumulative._id}
								>{gradeProgram.number} [{acumulative.number}° ({acumulative.percentage}%)]°
								({gradeProgram.percentage}%)</option
							>
						{/each}
					{/if}
				{/each}
			</Select>
		{/if}
		<label for="type">Tipo de trabajo</label>
		<Select bind:value={newWork.type} id={'type'}>
			<option value="">Seleccione una opci&oacute;n</option>
			<option value="files">Subida de archivos a calificar</option>
			<option value="form">Formulario</option>
		</Select>
		{#if newWork.type === 'form'}
			<label for="form"><i class="fa-solid fa-clipboard" /> Formulario asignado</label>
			<Select bind:value={newWork.form} id={'form'}>
				<option value="">Seleccione una opci&oacute;n</option>
				{#each forms as form}
					<option value={form._id}
						>{form.title}
						{form.has_points ? '(Con puntaje)' : '(Sin puntaje)'}
						{formatDate(form.upload_date)}</option
					>
				{/each}
			</Select>
		{:else if newWork.type === 'files'}
			<h3><i class="fa-solid fa-scroll" /> Pauta entrega de archivo(s)</h3>
			<Table header={['Titulo', 'Desc.', 'Puntaje', '']}>
				{#each newWork.pattern as item, i}
					<tr>
						<td><Input bind:value={item.title} /></td>
						<td><TextArea bind:value={item.description} /></td>
						<td><Input bind:value={item.points} type={'number'} /></td>
						<td
							><ButtonIcon
								title={'Eliminar item'}
								clickFunction={() => deleteItem(i)}
								classItem={'fa-solid fa-circle-minus'}
							/></td
						>
					</tr>
				{/each}
			</Table>
			<ButtonIcon
				clickFunction={addItem}
				title={'Añadir nuevo item a la pauta'}
				classItem={'fa-solid fa-plus'}
			/>
		{/if}
		<!-- Time -->
		<h3><i class="fa-solid fa-hourglass" /> Tiempo</h3>
		<!-- Start -->
		<label for="">Fecha inicio acceso al trabajo</label>
		<Input id={'limit'} type={'date'} bind:value={newWork.date_start} />
		<label for="">Hora inicio acceso al trabajo</label>
		<Input id={'limit'} type={'time'} bind:value={newWork.time_start} />
		<!-- Limit -->
		<label for="limit">Fecha l&iacute;mite acceso al trabajo</label>
		<Input id={'limit'} type={'date'} bind:value={newWork.date_limit} />
		<label for="">Hora l&iacute;mite acceso al trabajo</label>
		<Input id={'limit'} type={'time'} bind:value={newWork.time_limit} />
		<!-- /Time -->
		{#if newWork.type === 'form'}
			<label for="access">Tipo de acceso al formulario</label>
			<Select bind:value={newWork.form_access} id={'access'}>
				<option value="">Hasta fecha y hora l&iacute;mite</option>
				<option value="wtime">Con tiempo l&iacute;mite</option>
			</Select>
		{/if}
		{#if newWork.type === 'form' && newWork.form_access === 'wtime'}
			<label for="time_access">Tiempo de acceso al formulario (Horas:Minutos)</label>
			<Input type={'time'} id={'time_access'} bind:value={newWork.time_access} />
		{/if}
		<h3><i class="fa-solid fa-paperclip" /> Adjuntos (Opcional)</h3>
		<section class="Attached">
			{#each filesAttached as file, i}
				<File
					moduleId={idModule}
					{token}
					edit={true}
					deleteMe={() => deleteFile(i)}
					{file}
				/>
			{/each}
			{#each linksAttached as link, i}
				<Link deleteMe={() => deleteLink(i)} edit={true} {link} />
			{/each}
		</section>
		<Attached bind:filesAttached {token} bind:linksAttached />
		<Button type={'submit'}>Publicar</Button>
	</Form>
</section>

<style>
	.NewWork {
		background-color: white;
		margin: 20px;
		padding: 15px;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
		margin-bottom: 80vh;
	}

	.Attached {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
</style>
