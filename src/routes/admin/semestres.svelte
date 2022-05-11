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
	import type { Semester } from '$models/admin/semester.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'
	// Modal
	let modalSemester = false
	let modalEdit = false
	const toggleSemester = () => (modalSemester = !modalSemester)
	const toggleEdit = () => (modalEdit = !modalEdit)
	// Data
	let semesters: Semester[]
	let positionSemester: number
	let semesterData: Semester
	// Form
	let semesterForm = {
		semester: '',
		year: '',
	}

	onMount(async () => {
		try {
			const semestersData = await API.fetchGetData(
				`${variables.API}/api/semesters/get_semesters`,
				false,
				token,
			)
			semesters = semestersData.body.semesters
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function validatorsSemester(semesterForm) {
		if (parseInt(semesterForm.year) < 0)
			return { success: false, message: 'Debe indicar un año' }
		if (semesterForm.semester === '')
			return { success: false, message: 'Debe seleccionar un semestre' }
		return { success: true }
	}

	async function addSemester() {
		try {
			const validators = validatorsSemester(semesterForm)
			if (!validators) throw new Error(validators.message)
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/semesters/add_semester`,
				semesterForm,
				true,
				undefined,
				token,
			)
			modalSemester = false
			addToast({
				message: 'Se ha agregado exitosamente el semestre',
				type: 'success',
			})
			semesters = [dataFetch.body.semester, ...semesters]
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function initSemester() {
		try {
			const index = positionSemester
			await API.fetchData(
				'post',
				`${variables.API}/api/semesters/init_semester/${semesters[index]._id}`,
				undefined,
				true,
				undefined,
				token,
			)
			// Change status
			semesters[index].status = 2
			addToast({
				message: `Se ha inicializado el semestre y se han agregado los módulos de aula virtual`,
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function updateSemester() {
		try {
			const validators = validatorsSemester(semesterData)
			if (!validators) throw new Error(validators.message)
			const index = positionSemester
			const dataFetch = await API.fetchData(
				'put',
				`${variables.API}/api/semesters/update_semester/${semesterData._id}`,
				semesterData,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado con exito el semestre',
				type: 'success',
			})
			semesters[index] = dataFetch.body.semester
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
			clickFunction={toggleSemester}
			title={'Agregar semestre'}
			classItem={'fa-solid fa-plus'}
		/>
	</Icons>
	<h2>Semestres</h2>
	<br />
	{#if semesters}
		<Table header={['Año', 'Semestre', 'Estado', 'Inicializar semestre', 'Editar']}>
			{#each semesters as semester, i}
				<tr>
					<td>{semester.year}</td>
					<td>{semester.semester}°</td>
					<td
						>{semester.status === 0
							? 'Finalizado'
							: semester.status === 1
							? 'En espera'
							: 'Vigente'}</td
					>
					<td>
						<Button
							click={() => {
								positionSemester = i
								initSemester()
							}}
							type="button"><i class="fa-solid fa-flag" /></Button
						>
					</td>
					<td>
						<Button
							click={() => {
								toggleEdit()
								positionSemester = i
								semesterData = semester
								semesterData.semester = semesterData.semester.toString()
							}}
							type="button"><i class="fa-solid fa-pen-to-square" /></Button
						>
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
{#if modalSemester}
	<Modal onClose={toggleSemester}>
		<h2 slot="title">Agregar semestre</h2>
		<Form form={addSemester}>
			<label for="year">Año</label>
			<Input bind:value={semesterForm.year} id={'year'} type={'number'} />
			<label for="semester">Semestre</label>
			<Select bind:value={semesterForm.semester} id={'semester'}>
				<option value="">Seleccione un semestre</option>
				<option value="1">1°</option>
				<option value="2">2°</option>
			</Select>
			<Button type={'submit'}>Agregar semestre</Button>
		</Form>
	</Modal>
{/if}

{#if modalEdit}
	<Modal onClose={toggleEdit}>
		<h2 slot="title">
			Editar semestre {semesters[positionSemester].semester}° - {semesters[positionSemester]
				.year}
		</h2>
		<Form form={updateSemester}>
			<label for="year">Año</label>
			<Input bind:value={semesterData.year} id={'year'} type={'number'} />
			<label for="semester">Semestre</label>
			<Select bind:value={semesterData.semester} id={'semester'}>
				<option value="1">1°</option>
				<option value="2">2°</option>
			</Select>
			<Button type={'submit'}>Actualizar semestre</Button>
		</Form>
	</Modal>
{/if}

<style>
	td i {
		color: white;
	}
</style>
