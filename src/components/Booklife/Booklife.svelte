<script lang="ts">
	export let token: string
	export let idStudent: string = ''
	export let userType: string = ''
	export let idUser: string = ''

	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Select from '$components/HTML/Select.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { Semester } from '$models/admin/semester.model'
	import type { Observation } from '$models/booklife/observation.model'
	import { UserTypes } from '$models/users/user_type.model'

	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { formatDate } from '$utils/format'

	import { onMount } from 'svelte'

	let semesters: Array<Semester> = []
	let semesterSelected: Semester
	let observations: Array<Observation>

	// Modal
	let modalAdd = false
	const toggleModalAdd = () => {
		modalAdd = !modalAdd
		defaultObservationForm()
	}

	let observationForm = {
		observation: '',
		type: '',
	}

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/semesters/get_semesters`,
				false,
				token,
			)
			semesters = dataFetch.body.semesters
			if (semesters.length > 0) {
				getSemester(0)
			} else {
				semesterSelected = {
					semester: 1,
					year: 1,
					_id: '',
					status: 0,
				}
				observations = []
			}
		} catch (err) {
			semesterSelected = {
				semester: 1,
				year: 1,
				_id: '',
				status: 0,
			}
			semesters = []
			observations = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getSemester(index: number) {
		try {
			// Set
			semesterSelected = semesters[index]
			observations = undefined
			// Route
			let route: string
			if (userType === UserTypes.STUDENT || userType === UserTypes.STUDENT_DIRECTIVE) {
				route = `${variables.API}/api/booklife/get_booklife?semester=${semesterSelected._id}`
			} else {
				route = `${variables.API}/api/booklife/get_booklife_student/${idStudent}?semester=${semesterSelected._id}`
			}
			// Get data
			const dataFetchObs = await API.fetchGetData(route, false, token)
			observations = dataFetchObs.body.observations
		} catch (err) {
			semesterSelected = {
				semester: 1,
				year: 1,
				_id: '',
				status: 0,
			}
			semesters = []
			observations = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function getUserType(userType: string) {
		if (userType === UserTypes.TEACHER) return 'Profesor'
		if (userType === UserTypes.DIRECTIVE) return 'Directivo'
		if (userType === UserTypes.DIRECTOR) return 'Director'
	}

	// Upload/Update observations
	function defaultObservationForm() {
		observationForm = {
			observation: '',
			type: '',
		}
	}

	function validateObservation(form: { observation: string; type: string }) {
		if (form.observation.length > 500 || form.observation === '')
			throw new Error('Debe existir una observación de máx. 500 cárac.')
		if (form.type === '') throw new Error('Debe seleccionar un tipo de observación')
	}

	async function uploadObservation() {
		try {
			validateObservation(observationForm)
			const data = {
				observation: observationForm.observation,
				type: observationForm.type === 'true',
			}
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/booklife/upload_observation/${idStudent}/${semesterSelected._id}`,
				data,
				true,
				undefined,
				token,
			)
			defaultObservationForm()
			observations = [dataFetch.body.observation, ...observations]
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function updateObservation(observation: string, id: string) {
		try {
			if (observation === '') throw new Error('La observación no puede estar vacía')
			await API.fetchData(
				'put',
				`${variables.API}/api/booklife/update_observation/${id}`,
				{ observation },
				true,
				undefined,
				token,
			)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteObservation(id: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API}/api/booklife/delete_observation/${id}`,
				true,
				token,
			)
			observations = observations.filter((observation) => {
				if (observation._id !== id) return observation
			})
			addToast({
				message: 'Se ha eliminado la observación exitosamente',
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

<section class="Booklife">
	<aside class="Semesters">
		<ul>
			{#each semesters as semester, i}
				<li>
					<ButtonText click={() => getSemester(i)}
						>{semester.year} {semester.semester}°</ButtonText
					>
				</li>
			{:else}
				<li>Sin semestres...</li>
			{/each}
		</ul>
	</aside>
	<section class="Observations">
		<h3>Observaciones {semesterSelected?.year} - {semesterSelected?.semester}°</h3>
		{#if observations}
			<header>
				<ButtonText click={toggleModalAdd}>
					<i class="fa-solid fa-plus" /> Agregar observaci&oacute;n
				</ButtonText>
			</header>
			{#each observations as observation}
				<article class="Observation">
					{#if idUser === observation.author._id || userType === UserTypes.DIRECTOR || userType === UserTypes.DIRECTIVE}
						<aside>
							<ButtonIcon
								clickFunction={() => deleteObservation(observation._id)}
								classItem={'fa-solid fa-xmark'}
							/>
						</aside>
					{/if}
					<small>Observaci&oacute;n {observation.type ? 'Positiva' : 'Negativa'}</small>
					{#if idUser === observation.author._id}
						<TextArea
							keydown={() =>
								updateObservation(observation.observation, observation._id)}
							bind:value={observation.observation}
						/>
					{:else}
						<pre>{observation.observation}</pre>
					{/if}
					<footer>
						<small>
							Anotado por
							<span>
								{getUserType(observation.author.user_type)}
								{observation.author.name}
								{observation.author.first_lastname}
							</span>
						</small>
						<small>{formatDate(observation.date)}</small>
					</footer>
				</article>
			{:else}
				<span>No hay observaciones en este periodo</span>
			{/each}
		{:else}
			<SpinnerGet />
		{/if}
	</section>
</section>

{#if modalAdd}
	<Modal onClose={toggleModalAdd}>
		<h2 slot="title">Agregar observaci&oacute;n</h2>
		<Form form={uploadObservation}>
			<label for="observation">Observaci&oacute;n</label>
			<TextArea bind:value={observationForm.observation} />
			<label for="type">Tipo</label>
			<Select bind:value={observationForm.type} id={'type'}>
				<option value="">Seleccione una opci&oacute;n</option>
				<option value="true">Positiva</option>
				<option value="false">Negativa</option>
			</Select>
			<Button type={'submit'}>Subir observaci&oacute;n</Button>
		</Form>
	</Modal>
{/if}

<style>
	.Booklife {
		display: grid;
		grid-template-columns: 1fr 4fr;
		gap: 20px;
	}

	.Semesters {
		border: 2px solid var(--color-light);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 5px;
		border-radius: 8px;
	}

	ul {
		list-style: none;
	}

	.Observations header {
		width: fit-content;
	}

	.Observations header i {
		color: var(--color-main);
	}

	.Observation {
		border-bottom: 2px solid var(--color-light);
		padding: 10px;
		position: relative;
	}

	.Observation aside {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.Observation pre {
		margin-top: 8px;
	}

	.Observation footer {
		margin-top: 15px;
		display: flex;
		justify-content: space-between;
	}

	.Observation footer span {
		color: var(--color-main);
	}
</style>
