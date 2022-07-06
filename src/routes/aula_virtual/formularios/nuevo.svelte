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
	import { intToRoman } from '$utils/format'
	import { deltaQuillToHtml } from '$utils/quill'
	import type Quill from 'quill'

	let form = {
		title: 'Nuevo formulario',
		type: '',
		items: [] as Array<ItemType>,
	}
	let checked: number = 0
	let question: number = 0
	let quill: Quill

	function newItem() {
		if (form.items.length !== 10) {
			form.items = [
				...form.items,
				{
					title: '',
					type: '',
					questions: [
						{
							question: '',
							type: '',
							alternatives: [],
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
		quill.setContents(form.items[checked].questions[question].question)
		form.items.splice(index, 1)
		form.items = form.items
	}

	function validators() {
		if (form.title.length === 0 || form.title.length > 100)
			throw new Error('El titlo del formulario debe ser de máx. 100 cárac.')
		if (form.type === '') throw new Error('Debe seleccionar un puntaje (preguntas)')
		if (form.items.length === 0) throw new Error('Debe haber mín. 1 item')
		form.items.forEach((item, i) => {
			if (item.title.length === 0 || item.title.length > 100)
				throw new Error(
					`El titulo del item ${intToRoman(i + 1)} debe ser de máx. 100 cárac.`,
				)
			if (form.type === 'true' && item.type === '')
				throw new Error(
					`Debe seleccionar una asignación de puntaje en el item ${intToRoman(i + 1)}`,
				)
			if (
				item.type === 'equal' &&
				(Number(item.points) <= 0 || !item.points) &&
				form.type === 'true'
			)
				throw new Error(
					`Debe indicar un puntaje total a distribuir mayor a 0 en el item ${intToRoman(
						i + 1,
					)}`,
				)
			if (item.questions.length === 0)
				throw new Error(`Debe haber mín. 1 pregunta en el item ${intToRoman(i + 1)}`)
			item.questions.forEach((question, iQ) => {
				if (question.type === '')
					throw new Error(
						`Debe seleccionar tipo de pregunta en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (deltaQuillToHtml(question.question).length === 0)
					throw new Error(
						`Debe escribir una pregunta en la pregunta ${iQ + 1} del item ${intToRoman(
							i + 1,
						)}`,
					)
				if (
					item.type === 'custom' &&
					form.type === 'true' &&
					Number(question.points) <= 0 &&
					question.type !== 'alternatives'
				)
					throw new Error(
						`El puntaje debe ser mayor a 0 en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (
					item.type === 'custom' &&
					form.type === 'true' &&
					!Number.isInteger(Number(question.points)) &&
					question.type !== 'alternatives'
				)
					throw new Error(
						`El puntaje debe ser entero en la pregunta ${iQ + 1} del item ${intToRoman(
							i + 1,
						)}`,
					)
				if (question.type.includes('alternatives') && question.alternatives.length <= 1)
					throw new Error(
						`Deben existir mín. 2 alternativas en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (question.type === 'written') {
					question.answers.forEach((answer, iA) => {
						if (answer.length === 0 || answer.length > 100)
							throw new Error(
								`La respuesta ${
									iA + 1
								} debe ser de máx. 100 cárac. de la pregunta ${
									iQ + 1
								} del item ${intToRoman(i + 1)}`,
							)
					})
				} else {
					question.alternatives.forEach((alternative, iA) => {
						if (
							alternative.alternative.length === 0 ||
							alternative.alternative.length > 100
						)
							throw new Error(
								`La alternativa ${iA + 1} de la pregunta ${
									iQ + 1
								} del item ${intToRoman(i + 1)} debe ser de máx. 100 cárac.`,
							)
					})
				}
				if (
					question.type === 'alternatives_correct' &&
					question.correct >= question.alternatives.length
				)
					throw new Error(
						`Debe existir una respuesta correcta en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
			})
			if (item.type === 'equal' && form.type === 'true') {
				const countQuestions = item.questions.reduce((a, b) => {
					const count = b.type !== 'alternatives' ? 1 : 0
					return a + count
				}, 0)
				const pointsPerQuestion = Number(item.points) / countQuestions
				if (!Number.isInteger(pointsPerQuestion))
					throw new Error(
						`El puntaje equitativo para cada pregunta del item ${intToRoman(
							i + 1,
						)} no es entero. (Resulta ${pointsPerQuestion})`,
					)
			}
		})
	}

	function buildData() {
		return {
			title: form.title,
			type: form.type,
			items: form.items.map((item) => {
				const itemData: any = {
					title: item.title,
					questions: item.questions.map((question) => {
						const questionData: any = {
							question: deltaQuillToHtml(question.question),
							type: question.type,
						}
						if (question.type.includes('alternatives'))
							questionData.alternatives = question.alternatives.map((alternative) => {
								return alternative.alternative
							})
						if (question.type === 'written') questionData.answers = question.answers
						if (questionData.type === 'alternatives_correct')
							questionData.correct = question.correct
						if (item.type === 'custom' && form.type === 'true')
							questionData.points = parseInt(question.points)
						return questionData
					}),
				}
				if (form.type === 'true') itemData.type = item.type
				if (item.type === 'equal' && form.type === 'true')
					itemData.points = parseInt(item.points)
				return itemData
			}),
		}
	}

	async function uploadForm() {
		try {
			validators()
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
		<Select bind:value={form.type} id={'score'}>
			<option value="">Seleccionar tipo de puntaje</option>
			<option value="true">Con puntaje</option>
			<option value="false">Sin puntaje</option>
		</Select>
		<h3><i class="fa-solid fa-cube" /> Items</h3>
		<section class="Form__items">
			{#each form.items as item, i}
				<Item
					destroy={() => deleteItem(i)}
					type={form.type}
					bind:question
					bind:quill
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
			<Question bind:quill bind:question {checked} bind:item={form.items[checked]} />
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
