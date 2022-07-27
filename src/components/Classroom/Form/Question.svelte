<script lang="ts">
	import type { ItemQuestion } from '$models/classroom/form.model'
	import TextArea from '$components/HTML/TextArea.svelte'
	import RichInput from '$components/HTML/RichInput.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import { formatDate, intToChar } from '$utils/format'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import type { AnswerWEvaluate } from '$models/classroom/answer.model'
	import type { User } from '$models/users/users.model'

	export let question: ItemQuestion
	export let number: number
	export let after: number = 0
	export let idWork: string
	export let answers: Array<AnswerWEvaluate>
	export let token: string
	export let statusWork: string

	let status = 0 // Init
	let timeout: NodeJS.Timeout
	let answer: AnswerWEvaluate
	let evaluator: User

	number += after

	// Resolve answer
	answer = answers[number - 1]
	// Answer
	if (answer) {
		status = 2
		if (question.type === 'written') {
			if (statusWork === 'revised') evaluator = answer.evaluate.evaluator as User
			question.answer = answer.answer.response
		} else {
			question.answer = answer.answer.answer.toString()
		}
	} else {
		question.answer = ''
	}

	function deleteQuestion() {
		question.answer = ''
		saveQuestion()
	}

	function buildData() {
		const body: any = {}
		if (question.type === 'written' && question.answer !== '') body.response = question.answer
		if (question.type !== 'written' && question.answer !== '')
			body.answer = parseInt(question.answer)
		return body
	}

	async function saveQuestion() {
		try {
			status = 1
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/save_answer/${idWork}/${question._id}`,
				buildData(),
				false,
				undefined,
				token,
			)
			if (question.answer !== '') {
				status = 2
			} else {
				status = 0
			}
		} catch (err) {
			status = 3
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<article class="Question" id="pregunta{number}">
	<header class="Question__header">
		<h4>
			{number})
			{#if statusWork === 'opened'}
				{#if status === 1}
					<i class="fa-solid fa-spinner" title="Guardando..." />
				{:else if status === 2}
					<i class="fa-solid fa-circle-check" title="Guardada" />
				{:else if status === 3}
					<i class="fa-solid fa-circle-xmark Error" title="Fallo al guardar" />
				{/if}
			{/if}
		</h4>
		<RichInput body={question.question} readOnly={true} />
	</header>
	{#if !question.type.includes('alternatives')}
		{#if statusWork === 'opened'}
			<TextArea
				keydown={() => {
					status = 1
					if (timeout) {
						clearTimeout(timeout)
						timeout = null
					}
					timeout = setTimeout(saveQuestion, 2000)
				}}
				placeholder={'Respuesta...'}
				bind:value={question.answer}
			/>
		{:else}
			<pre>R\: {question.answer}</pre>
			{#if statusWork === 'revised'}
				<span>
					Puntaje obtenido:
					<span class="Correct">{answer.evaluate.points} pts.</span>
				</span>
				<small>
					Evaluador:
					<span class="Correct">
						{evaluator.name}
						{evaluator.first_lastname}
					</span>
					{formatDate(answer.evaluate.date)}
				</small>
				{#if question.answers}
					<div>
						<h4>Posibles respuestas</h4>
						{#each question.answers as answers}
							<p>- {answers}</p>
						{/each}
					</div>
				{/if}
			{/if}
		{/if}
	{:else}
		{#each question.answers as answer, i}
			<div class="Answer">
				<span>{intToChar(i)})</span>
				<input
					bind:group={question.answer}
					on:change={saveQuestion}
					value={i.toString()}
					type="radio"
					disabled={statusWork !== 'opened'}
				/>
				<p>{answer}</p>
				{#if statusWork === 'revised' && i === question.correct}
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
	{#if question.type !== 'written' && statusWork === 'opened'}
		<div>
			<ButtonIcon
				title={'Eliminar respuesta'}
				clickFunction={deleteQuestion}
				classItem={'fa-solid fa-delete-left'}
			/>
		</div>
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

	.Question__header h4 i {
		font-size: 0.7rem;
	}

	.Answer {
		display: flex;
		gap: 10px;
	}

	.Error {
		color: var(--color-danger);
	}

	i {
		color: var(--color-main);
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
</style>
