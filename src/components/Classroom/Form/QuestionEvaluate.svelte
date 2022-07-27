<script lang="ts">
	import type { ItemQuestion } from '$models/classroom/form.model'
	import RichInput from '$components/HTML/RichInput.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import { intToChar } from '$utils/format'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import type { AnswerWEvaluate } from '$models/classroom/answer.model'
	import Input from '$components/HTML/Input.svelte'

	export let question: ItemQuestion
	export let number: number
	export let after: number = 0
	export let idWork: string
	export let idStudent: string
	export let answers: Array<AnswerWEvaluate>
	export let token: string
	export let hasPoints: boolean

	number += after
	let points: string = ''

	// Find answer
	const index = answers?.findIndex((a) => {
		return a.answer.question === question._id
	})
	if (index !== undefined && index !== -1) {
		if (question.type === 'written') {
			question.answer = answers[index].answer.response
		} else {
			question.answer = answers[index].answer.answer.toString()
		}
	} else {
		question.answer = ''
	}
	// Points
	if (question.type === 'written' && answers[index]?.evaluate)
		points = answers[index].evaluate.points.toString()

	async function uploadPoints() {
		try {
			if (points === '') throw new Error('Debe indicar un puntaje para la pregunta')
			const pointsNumber = Number(points)
			if (!Number.isInteger(pointsNumber)) throw new Error('El puntaje debe ser entero')
			if (pointsNumber < 0) throw new Error('El puntaje debe ser mayor a cero')
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/upload_points_question/${idWork}/${question._id}/${idStudent}`,
				{ points: pointsNumber },
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado el puntaje de la pregunta exitosamente',
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

<article class="Question" id="pregunta{number}">
	<header class="Question__header">
		<h4>{number})</h4>
		<RichInput body={question.question} readOnly={true} />
	</header>
	{#if !question.type.includes('alternatives')}
		<pre>R\: {question.answer !== '' ? question.answer : 'Sin respuesta'}</pre>
		{#if hasPoints}
			<br />
			<label for="points">Puntaje final</label>
			<div class="Points">
				<Input id={'points'} type={'number'} bind:value={points} />
				<ButtonIcon
					title={'Subir puntaje'}
					clickFunction={uploadPoints}
					classItem={'fa-solid fa-arrow-up-from-bracket'}
				/>
			</div>
		{/if}
	{:else}
		{#each question.answers as answer, i}
			<div class="Answer">
				<span>{intToChar(i)})</span>
				<input bind:group={question.answer} value={i.toString()} type="radio" disabled />
				<p>{answer}</p>
				{#if question.type === 'alternatives_correct' && i === question.correct}
					<span class="Correct">Correcta</span>
				{/if}
			</div>
		{/each}
	{/if}
	{#if question.type === 'alternatives'}
		<small>Pregunta sin puntaje</small>
	{/if}
	{#if question.points}
		<small>Puntaje: {question.points} pts.</small>
	{/if}
</article>

<style>
	.Question {
		margin: 15px;
		padding-bottom: 15px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		border-bottom: 2px solid var(--color-light);
	}

	.Question__header {
		display: flex;
		width: 100%;
		gap: 5px;
	}

	.Question__header h4 {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.Answer {
		display: flex;
		gap: 10px;
	}

	input[type='radio']:checked:after {
		width: 7px;
		height: 7px;
		border-radius: 15px;
		top: 1px;
		left: 3px;
		position: relative;
		background-color: #0075ff;
		content: '';
		display: inline-block;
	}

	.Correct {
		color: var(--color-main);
		font-weight: bold;
	}

	.Points {
		display: flex;
		gap: 20px;
		align-items: center;
	}
</style>
