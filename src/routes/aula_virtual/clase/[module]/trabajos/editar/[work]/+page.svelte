<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Work } from '$models/classroom/work.model'
	import type { GradeProgram } from '$models/classroom/grade.model'
	import type { UserForm } from '$models/classroom/form.model'
	import type { UserFiles } from '$models/users/files.model'
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Table from '$components/HTML/Table.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import File from '$components/Classroom/File.svelte'
	import Attached from '$components/Classroom/Attached.svelte'
	import Link from '$components/Classroom/Link.svelte'
	import Button from '$components/HTML/Button.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import {
		formatDate,
		formatDateUTC,
		getOnlyTime,
		removeTime,
		secondsToHoursFormat,
	} from '$utils/format'
	import { validateWorkEdit } from '$utils/validators'

	// Init variables
	let idWork = $page.params.work
	let idModule = $page.params.module
	let token = data.user.token

	// Data
	let work: Work
	let gradePrograms: Array<GradeProgram>
	let forms: Array<UserForm>
	// Dates
	let canEdit = false
	let dates = {
		start_date: '',
		start_hour: '',
		limit_date: '',
		limit_hour: '',
	}
	let timeAccess = ''
	// Attached
	let linksAttached = [] as Array<{
		title: string
		link: string
		_id_attached?: string
	}>
	let filesAttached = [] as Array<UserFiles & { _id_attached?: string }>

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/works/get_work/${idWork}`,
					false,
					token,
				),
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
			work = dataFetch[0].body.work
			gradePrograms = dataFetch[1].body.programs ? dataFetch[1].body.programs : []
			forms = dataFetch[2].body.forms ? dataFetch[2].body.forms : []
			// Set dates
			dates.start_date = removeTime(work.date_start)
			dates.start_hour = getOnlyTime(work.date_start)
			dates.limit_date = removeTime(work.date_limit)
			dates.limit_hour = getOnlyTime(work.date_limit)
			timeAccess = secondsToHoursFormat(work.time_access)
			// Set attached
			work.attached.forEach((attached) => {
				if (attached.type === 'file')
					filesAttached = [
						...filesAttached,
						{
							...attached.file,
							_id_attached: attached._id,
						},
					]
				if (attached.type === 'link')
					linksAttached = [
						...linksAttached,
						{
							title: attached.title,
							link: attached.link,
							_id_attached: attached._id,
						},
					]
			})
			// Can edit
			canEdit = new Date().getTime() < new Date(work.date_start).getTime()
			console.log(work)
		} catch (err) {
			work = null
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function buildData() {
		const splitTime = timeAccess.split(':')
		return {
			title: work.title,
			description: work.description,
			grade: work.grade._id,
			form: work.form,
			pattern: work.pattern.map((item) => {
				return {
					...item,
					points: Number(item.points),
				}
			}),
			form_access: work.form_access,
			attached: [
				...filesAttached.map((file) => {
					return {
						file: file._id.$oid ? file._id.$oid : file._id,
						type: 'file',
					}
				}),
				...linksAttached.map((link) => {
					return { link: link.link, title: link.title, type: 'link' }
				}),
			],
			time_access:
				work.type === 'form' && work.form_access === 'wtime'
					? parseInt(splitTime[0]) * 60 ** 2 + parseInt(splitTime[1]) * 60
					: undefined,
			date_start: formatDateUTC(new Date(`${dates.start_date} ${dates.start_hour}`)),
			date_limit: formatDateUTC(new Date(`${dates.limit_date} ${dates.limit_hour}`)),
		}
	}

	async function updateWork() {
		try {
			validateWorkEdit(work, dates, timeAccess)
			await API.fetchData(
				'put',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/update_work/${work._id}`,
				buildData(),
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado el trabajo exitosamente',
				type: 'success',
			})
			goto('../../trabajos')
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function addItem() {
		work.pattern = [
			...work.pattern,
			{
				title: '',
				description: '',
				points: 0,
			},
		]
	}

	async function deleteItem(index: number) {
		try {
			const idItem = work.pattern[index]._id
			if (idItem)
				await API.fetchDeleteData(
					`${variables.API_CLASSROOM_WRITE}/api/classroom/works/delete_item_pattern/${work._id}/${idItem}`,
					true,
					token,
				)
			work.pattern.splice(index, 1)
			work.pattern = work.pattern
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteFile(index: number) {
		try {
			const idAttached = filesAttached[index]._id_attached
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/delete_attached/${work._id}/${idAttached}`,
				true,
				token,
			)
			filesAttached.splice(index, 1)
			filesAttached = filesAttached
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteLink(index: number) {
		try {
			const idAttached = linksAttached[index]._id_attached
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/delete_attached/${work._id}/${idAttached}`,
				true,
				token,
			)
			linksAttached.splice(index, 1)
			linksAttached = linksAttached
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

{#if work}
	<section class="NewWork">
		<Form form={updateWork}>
			<label for="title">Titulo trabajo</label>
			<Input bind:value={work.title} id={'title'} />
			<label for="">Descripci&oacute;n del trabajo (Opcional)</label>
			<TextArea bind:value={work.description} />
			{#if work.is_qualified && gradePrograms}
				<label for="grade">Calificaci&oacute;n asignada</label>
				<Select id={'grade'} bind:value={work.grade._id}>
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
			{#if canEdit}
				{#if work.type === 'form'}
					<label for="form"><i class="fa-solid fa-clipboard" /> Formulario asignado</label
					>
					<Select bind:value={work.form} id={'form'}>
						<option value="">Seleccione una opci&oacute;n</option>
						{#each forms as form}
							<option value={form._id}
								>{form.title}
								{form.has_points ? '(Con puntaje)' : '(Sin puntaje)'}
								{formatDate(form.upload_date)}</option
							>
						{/each}
					</Select>
				{:else if work.type === 'files'}
					<h3>
						<i class="fa-solid fa-scroll" /> Pauta entrega de archivo(s) *Eliminaci&oacute;n
						sincr&oacute;nica
					</h3>
					<Table header={['Titulo', 'Desc.', 'Puntaje', '']}>
						{#each work.pattern as item, i}
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
			{/if}
			<!-- Time -->
			<h3><i class="fa-solid fa-hourglass" /> Tiempo</h3>
			{#if canEdit}
				<!-- Start -->
				<label for="">Fecha inicio acceso al trabajo</label>
				<Input id={'limit'} type={'date'} bind:value={dates.start_date} />
				<label for="">Hora inicio acceso al trabajo</label>
				<Input id={'limit'} type={'time'} bind:value={dates.start_hour} />
			{/if}
			<!-- Limit -->
			<label for="limit">Fecha l&iacute;mite acceso al trabajo</label>
			<Input id={'limit'} type={'date'} bind:value={dates.limit_date} />
			<label for="">Hora l&iacute;mite acceso al trabajo</label>
			<Input id={'limit'} type={'time'} bind:value={dates.limit_hour} />
			<!-- /Time -->
			{#if canEdit}
				{#if work.type === 'form'}
					<label for="access">Tipo de acceso al formulario</label>
					<Select bind:value={work.form_access} id={'access'}>
						<option value="default">Hasta fecha y hora l&iacute;mite</option>
						<option value="wtime">Con tiempo l&iacute;mite</option>
					</Select>
				{/if}
				{#if work.type === 'form' && work.form_access === 'wtime'}
					<label for="time_access">Tiempo de acceso al formulario (Horas:Minutos)</label>
					<Input type={'time'} id={'time_access'} bind:value={timeAccess} />
				{/if}
			{/if}
			<h3>
				<i class="fa-solid fa-paperclip" /> Adjuntos (Opcional) *Eliminaci&oacute;n sincr&oacute;nica
			</h3>
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
			<Button type={'submit'}>Editar trabajo</Button>
		</Form>
	</section>
{:else}
	<SpinnerGet />
{/if}

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
