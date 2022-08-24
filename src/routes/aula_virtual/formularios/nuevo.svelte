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
	import { goto } from '$app/navigation'

	export let token: string

	import Item from '$components/Classroom/Forms/Item.svelte'
	import Question from '$components/Classroom/Forms/Question.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Select from '$components/HTML/Select.svelte'
	import { variables } from '$lib/variables'
	import type { ItemType } from '$models/classroom/item.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { validateForm } from '$utils/validators'
	import type { Editor } from '@tiptap/core'

	let form = {
		title: 'Nuevo formulario',
		has_points: '',
		items: [] as Array<ItemType>,
	}
	let checked: number = 0
	let question: number = 0
	let editor: Editor

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
		editor.commands.setContent(form.items[checked].questions[question].question)
		form.items.splice(index, 1)
		form.items = form.items
	}

	function buildData() {
		return {
			title: form.title,
			has_points: form.has_points,
			items: form.items.map((item) => {
				const itemData: any = {
					title: item.title,
					questions: item.questions.map((question) => {
						const questionData: any = {
							question: question.question,
							type: question.type,
							answers: question.answers,
						}
						if (questionData.type === 'alternatives_correct')
							questionData.correct = question.correct
						if (item.points_type === 'custom' && form.has_points === 'true')
							questionData.points = parseInt(question.points)
						return questionData
					}),
				}
				if (form.has_points === 'true') itemData.points_type = item.points_type
				if (item.points_type === 'equal' && form.has_points === 'true')
					itemData.points = parseInt(item.points)
				return itemData
			}),
		}
	}

	async function uploadForm() {
		try {
			validateForm(form)
			const data = buildData()
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/forms/upload_form`,
				data,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha añadido el formulario exitosamente',
				type: 'success',
			})
			goto('/aula_virtual/formularios')
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="Form">
	<input bind:value={form.title} type="text" placeholder="Titulo" />
	<Form form={uploadForm}>
		<label for="score">Puntaje (Preguntas)</label>
		<Select bind:value={form.has_points} id={'score'}>
			<option value="">Seleccionar tipo de puntaje</option>
			<option value="true">Con puntaje</option>
			<option value="false">Sin puntaje</option>
		</Select>
		<h3><i class="fa-solid fa-cube" /> Items</h3>
		<section class="Form__items">
			{#each form.items as item, i}
				<Item
					destroy={() => deleteItem(i)}
					type={form.has_points}
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
		{#if form.items.length > 0}
			<Question bind:editor bind:question {checked} bind:item={form.items[checked]} />
		{/if}
		<Button type={'submit'}>Subir formulario</Button>
	</Form>
</section>

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
</style>
