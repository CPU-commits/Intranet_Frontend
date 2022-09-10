<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { UserForm } from '$models/classroom/form.model'
	import type { Session } from '$models/session.model'
	import type { Editor } from '@tiptap/core'
	// Svelte
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import Item from '$components/Classroom/Forms/Item.svelte'
	import Question from '$components/Classroom/Forms/Question.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import { validateForm } from '$utils/validators'

	// Init variables
	let idForm = $page.params.idForm
	let token = data.user.token

	let question: number = 0
	let editor: Editor
	let checked: number
	// Data
	let form: UserForm
	let hasPoints: string
	// Modal
	let modal = false
	const toggleModal = () => (modal = !modal)

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/forms/get_form/${idForm}`,
				false,
				token,
			)
			let formData: UserForm = dataFetch.body.form

			formData.items = formData.items.map((item) => {
				const { questions, ...rest } = item
				return {
					...rest,
					questions: questions.map((questionUn) => {
						const { answers, question, ...rest } = questionUn
						return {
							...rest,
							question,
							answers: answers ? answers : [],
						}
					}),
					points: questions
						.reduce((a, b) => {
							if (b.points) return a + Number(b.points)
							return a
						}, 0)
						.toString(),
				}
			})

			form = formData
			hasPoints = String(form.has_points)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function newItem() {
		if (form.items.length !== 10) {
			form.items = [
				...form.items,
				{
					title: '',
					points_type: '',
					questions: [
						{
							question: '',
							type: '',
							answers: [],
							correct: 0,
							points: '0',
						},
					],
				},
			]
		} else {
			addToast({
				message: 'Máx. 10 items',
				type: 'error',
			})
		}
	}

	function deleteItem(index: number) {
		question = 0
		checked = 0
		if (editor) editor.commands.setContent(form.items[checked].questions[question].question)
		form.items.splice(index, 1)
		form.items = form.items
	}

	async function updateForm() {
		try {
			form.has_points = hasPoints
			validateForm(form)
			let newForm = JSON.parse(JSON.stringify(form))
			newForm.items = newForm.items.map((item) => {
				const { questions, points, ...rest } = item
				return {
					...rest,
					questions: questions.map((questionData) => {
						const { question, points, ...rest } = questionData
						return {
							...rest,
							question,
							points: points ? parseInt(points) : undefined,
						}
					}),
					points: points ? parseInt(points) : undefined,
				}
			})
			await API.fetchData(
				'put',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/forms/update_form/${idForm}`,
				newForm,
				true,
				undefined,
				token,
			)
			goto('/aula_virtual/formularios')
			addToast({
				message: 'Se ha actualizado el formulario exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteForm() {
		try {
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/forms/delete_form/${idForm}`,
				true,
				token,
			)
			goto('/aula_virtual/formularios')
			addToast({
				message: 'Se ha eliminado el formulario exitosamente',
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

{#if form}
	<section class="Form">
		<input bind:value={form.title} type="text" placeholder="Titulo" />
		<Form form={updateForm}>
			<label for="score">Puntaje (Preguntas)</label>
			<Select bind:value={hasPoints} id={'score'}>
				<option value="">Seleccionar tipo de puntaje</option>
				<option value="true">Con puntaje</option>
				<option value="false">Sin puntaje</option>
			</Select>
			<h3><i class="fa-solid fa-cube" /> Items</h3>
			<section class="Form__items">
				{#each form.items as item, i}
					<Item
						destroy={() => deleteItem(i)}
						type={hasPoints}
						bind:question
						bind:editor
						bind:item
						bind:checked
						number={i}
					/>
				{:else}
					<span>Sin items</span>
				{/each}
				<ButtonIcon
					title={'Nuevo item'}
					clickFunction={newItem}
					classItem={'fa-solid fa-plus'}
				/>
			</section>
			{#if form.items.length > 0 && checked !== undefined}
				<Question bind:editor bind:question {checked} bind:item={form.items[checked]} />
			{/if}
			<Button type={'submit'}>Actualizar formulario</Button>
			<div>
				<ButtonIcon
					color={'var(--color-danger)'}
					hover={'var(--color-danger)'}
					classItem={'fa-solid fa-trash-can'}
					title={'Eliminar formulario'}
					clickFunction={toggleModal}
				/>
			</div>
		</Form>
	</section>
{:else}
	<SpinnerGet />
{/if}

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Eliminar formulario</h2>
		<span>¿Est&aacute; seguro de querer eliminar el formulario?</span>
		<div class="Container">
			<ButtonText color={'var(--color-dark)'} click={toggleModal}
				>No, no eliminar formulario</ButtonText
			>
			<ButtonText color={'var(--color-danger)'} click={deleteForm}
				>S&iacute;, eliminar formulario</ButtonText
			>
		</div>
	</Modal>
{/if}

<style>
	.Form {
		margin: 20px;
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
		border-radius: 10px;
		margin-bottom: 95vh;
	}

	.Form input:first-child {
		border: none;
		margin-bottom: 20px;
		font-size: 1.6rem;
		font-family: 'Karla', sans-serif;
	}

	.Form input:first-child:focus {
		outline: none;
	}

	.Form__items {
		display: flex;
		flex-direction: column;
		padding: 10px;
		gap: 20px;
		border: 2px solid var(--color-light);
	}

	span {
		text-align: center;
		margin-bottom: 20px;
	}

	.Container {
		display: flex;
	}
</style>
