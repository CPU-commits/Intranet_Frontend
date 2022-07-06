<script lang="ts">
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Input from '$components/HTML/Input.svelte'
	import RichInput from '$components/HTML/RichInput.svelte'
	import Select from '$components/HTML/Select.svelte'
	import type { ItemType } from '$models/classroom/item.model'
	import { addToast } from '$stores/toasts'
	import { intToRoman } from '$utils/format'
	import type Quill from 'quill'

	export let checked: number
	export let item: ItemType
	export let question: number
	export let quill: Quill

	function newQuestion() {
		if (item.questions.length !== 100) {
			item.questions = [
				...item.questions,
				{
					question: '',
					type: '',
					alternatives: [],
					answers: [],
					correct: 0,
					points: '0',
				},
			]
		} else {
			addToast({
				message: 'Máx. 100 preguntas',
				type: 'error',
			})
		}
	}

	function newAnswer() {
		if (item.questions[question].type === 'written') {
			item.questions[question].answers = [...item.questions[question].answers, '']
		} else {
			item.questions[question].alternatives = [
				...item.questions[question].alternatives,
				{
					alternative: '',
				},
			]
		}
	}

	function deleteQuestion() {
		const length = item.questions.length
		if (length > 1) {
			item.questions.splice(question, 1)
			if (length === question + 1) question--
			item.questions = item.questions
			quill.setContents(item.questions[question].question)
		} else {
			addToast({
				message: 'Debe existir mín. 1 pregunta',
				type: 'error',
			})
		}
	}

	function deleteAlternative(index: number) {
		item.questions[question].alternatives.splice(index, 1)
		item.questions[question].alternatives = item.questions[question].alternatives
	}

	function deleteAnswer(index: number) {
		item.questions[question].answers.splice(index, 1)
		item.questions[question].answers = item.questions[question].answers
	}

	function changeQuestion(index: number) {
		item.questions[question].question = quill.getContents()
		question = index
		quill.setContents(item.questions[question].question)
	}
</script>

<h3>
	<i class="fa-solid fa-clipboard-question" /> Preguntas [Item {intToRoman(checked + 1)}]
</h3>
<section class="Form__questions">
	<aside>
		<ButtonIcon
			title={'Eliminar pregunta'}
			classItem={'fa-solid fa-xmark'}
			clickFunction={deleteQuestion}
		/>
	</aside>
	<label for="question__type">Tipo de pregunta</label>
	<Select bind:value={item.questions[question].type} id={'question__type'}>
		<option value="">Seleccionar tipo de pregunta</option>
		<option value="alternatives_correct">Alternativas con correcta</option>
		<option value="alternatives">Alternativas sin correcta (No influye en el puntaje)</option>
		<option value="written">Respuesta escrita</option>
	</Select>
	<br />
	<RichInput
		focusDown={() => {
			item.questions[question].question = quill.getContents()
		}}
		placeholder={'Pregunta'}
		bind:value={quill}
	/>
	{#if item.type === 'custom' && item.questions[question].type !== 'alternatives'}
		<div class="Form__questions--points">
			<Input
				placeholder={'Puntaje pregunta'}
				type={'number'}
				id={'points'}
				bind:value={item.questions[question].points}
			/>
		</div>
	{/if}
	<div class="Form__questions--block">
		{#each item.questions as _, i}
			<button
				type="button"
				on:click={() => changeQuestion(i)}
				class:Selected={i === question}
				class="BlockQuestion"
			>
				{i + 1}
			</button>
		{:else}
			<span>Sin preguntas</span>
		{/each}
	</div>
	{#if item.questions[question].type.includes('alternatives')}
		<h4>Alternativas</h4>
		<section class="Answers">
			{#each item.questions[question].alternatives as alternative, i}
				<div class="Answer">
					<span>{i + 1})</span>
					{#if item.questions[question].type === 'alternatives_correct'}
						<input
							bind:group={item.questions[question].correct}
							value={i}
							title="Marcar como correcta"
							type="radio"
						/>
					{/if}
					<Input
						placeholder={'Alternativa'}
						bind:value={alternative.alternative}
						id={'alternative'}
					/>
					<ButtonIcon
						title={'Eliminar alternativa'}
						classItem={'fa-solid fa-xmark'}
						clickFunction={() => deleteAlternative(i)}
					/>
				</div>
			{/each}
			<ButtonIcon
				title={'Nueva alternativa'}
				clickFunction={newAnswer}
				classItem={'fa-solid fa-square-plus'}
			/>
		</section>
	{:else if item.questions[question].type === 'written'}
		<h4>Posibles respuestas (Opcional)</h4>
		<section class="Answers">
			{#each item.questions[question].answers as answer, i}
				<div class="Answer">
					<Input placeholder={'Respuesta'} bind:value={answer} id={'answer'} />
					<ButtonIcon
						title={'Eliminar alternativa'}
						classItem={'fa-solid fa-xmark'}
						clickFunction={() => deleteAnswer(i)}
					/>
				</div>
			{/each}
			<ButtonIcon
				title={'Nueva respuesta'}
				clickFunction={newAnswer}
				classItem={'fa-solid fa-square-plus'}
			/>
		</section>
	{/if}
	<ButtonIcon
		title={'Nueva pregunta'}
		clickFunction={newQuestion}
		classItem={'fa-solid fa-circle-plus'}
	/>
</section>

<style>
	.Form__questions {
		padding: 30px;
		border: 2px solid var(--color-light);
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.Form__questions--block {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		margin-bottom: 20px;
		gap: 4px;
		flex-wrap: wrap;
	}

	.Form__questions aside {
		position: absolute;
		right: 10px;
		top: 10px;
	}

	.BlockQuestion {
		padding: 5px;
		width: 20px;
		height: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid var(--color-light);
		background-color: transparent;
		transition: all 0.4s ease;
	}

	.BlockQuestion:hover {
		color: var(--color-main);
	}

	.Selected {
		color: var(--color-main);
	}

	.Answers {
		display: flex;
		flex-direction: column;
		padding: 15px;
		align-items: center;
		border: 1px solid var(--color-light);
		margin-bottom: 20px;
		gap: 10px;
	}

	.Answer {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 5px;
	}

	.Form__questions--points {
		max-width: 150px;
	}
</style>
