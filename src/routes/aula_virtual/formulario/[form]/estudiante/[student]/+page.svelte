<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		form: UserForm
		answers: Array<AnswerWEvaluate>
	}

	// Types
	import type { AnswerWEvaluate } from '$models/classroom/answer.model'
	import type { UserForm } from '$models/classroom/form.model'
	import type { Session } from '$models/session.model'
	// Components
	import Form from '$components/Classroom/Form/Form.svelte'
	import QuestionEvaluate from '$components/Classroom/Form/QuestionEvaluate.svelte'
	// Utils
	import { intToRoman } from '$utils/format'
	import { page } from '$app/stores'

	let answers = data.answers
	let form = data.form
	let token = data.user.token
	let idWork = $page.params.form
	let idStudent = $page.params.student
</script>

<Form>
	{#each form.items as item, i}
		<h3>{intToRoman(i + 1)}. {item.title}</h3>
		{#each item.questions as question, j}
			<QuestionEvaluate
				{answers}
				hasPoints={form.has_points.toString() === 'true'}
				{token}
				{idWork}
				{idStudent}
				after={i - 1 !== -1 ? form.items[i - 1].questions.length : 0}
				number={j + 1}
				{question}
			/>
		{/each}
	{/each}
	<div slot="questions" class="Questions">
		<div class="Questions__content">
			{#each form.items as item, i}
				{#each item.questions as question, j}
					<a
						class:Done={question.answer !== ''}
						href="#pregunta{j +
							1 +
							(i - 1 !== -1 ? form.items[i - 1].questions.length : 0)}"
					>
						{j + 1 + (i - 1 !== -1 ? form.items[i - 1].questions.length : 0)}
					</a>
				{/each}
			{/each}
		</div>
	</div>
</Form>

<style>
	.Questions__content {
		margin: 10px 0;
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}

	.Done {
		background-color: white;
		color: var(--color-main) !important;
	}

	.Questions__content a {
		border: 1px solid white;
		height: 15px;
		width: 15px;
		display: flex;
		font-size: 0.9rem;
		justify-content: center;
		align-items: center;
		text-decoration: none;
		color: white;
	}

	.Questions {
		position: sticky;
		top: 10px;
		background-color: var(--color-main);
		padding: 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: fit-content;
		border-radius: 5px;
	}
</style>
