<script context="module">
	import { variables } from '$lib/variables'

	import { UserTypes } from '$models/users/user_type.model'
	import API from '$utils/APIModule'

	export async function load({ session, params }) {
		if (session.user.user_type !== UserTypes.TEACHER)
			return {
				status: 401,
				error: 'No tienes acceso a esta ruta',
			}
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/works/get_form_student/${params.form}/${params.student}`,
				false,
				session.user.token,
			)
			return {
				status: 200,
				props: {
					answers: dataFetch.body.answers ? dataFetch.body.answers : [],
					form: dataFetch.body.form,
					token: session.user.token,
					idWork: params.form,
					idStudent: params.student,
				},
			}
		} catch (err) {
			return {
				status: err.statusCode,
				error: err.message,
			}
		}
	}
</script>

<script lang="ts">
	import type { AnswerWEvaluate } from '$models/classroom/answer.model'
	import type { UserForm } from '$models/classroom/form.model'
	import { intToRoman } from '$utils/format'
	import Form from '$components/Classroom/Form/Form.svelte'
	import QuestionEvaluate from '$components/Classroom/Form/QuestionEvaluate.svelte'

	export let answers: Array<AnswerWEvaluate>
	export let form: UserForm
	export let token: string
	export let idWork: string
	export let idStudent: string
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
