<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		form: UserForm
		answers: Array<AnswerWEvaluate>
		work: { date_limit: Date; wtime: boolean; status: string }
		points: { max_points: number; total_points: number }
	}

	// Types
	import type { ItemQuestion, UserForm } from '$models/classroom/form.model'
	import type { Session } from '$models/session.model'
	import type { AnswerWEvaluate } from '$models/classroom/answer.model'
	// Modules
	import moment from 'moment-with-locales-es6'
	// Svelte
	import { goto } from '$app/navigation'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import Question from '$components/Classroom/Form/Question.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	import Modal from '$components/Modal.svelte'
	import Form from '$components/Classroom/Form/Form.svelte'
	// Utils
	import { intToRoman } from '$utils/format'
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	let form = data.form
	let answers = data.answers
	let idWork = $page.params.idWork
	let token = data.user.token
	let work = data.work
	let points = data.points

	// Modal
	let modal = false
	const toggleModal = () => (modal = !modal)

	let seconds: string

	if (work.wtime && work.status === 'opened') sleep()

	async function sleep() {
		seconds = moment.utc(moment(work.date_limit).diff(moment(new Date()))).format('HH:mm:ss')
		while (seconds !== '00:00:00') {
			seconds = moment
				.utc(moment(work.date_limit).diff(moment(new Date())))
				.format('HH:mm:ss')
			await setSeconds()
		}
		finishForm()
	}

	function setSeconds() {
		return new Promise((resolve) => setTimeout(resolve, 1000))
	}

	async function finishForm() {
		try {
			const formAnswers = form.items.flatMap((item) => {
				return item.questions.map((question: ItemQuestion) => {
					const answer: any = {
						question: question._id,
					}
					if (question.type === 'written') {
						answer.response = question.answer
					} else {
						answer.answer = parseInt(question.answer)
					}
					return answer
				})
			})
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/finish_form/${idWork}`,
				{ answers: formAnswers },
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Formulario finalizado',
				type: 'success',
			})
			goto(`/aula_virtual`)
		} catch (err) {
			console.log(err.message)
			addToast({
				message: 'No se ha podido guardar el formulario',
				type: 'error',
			})
		}
	}

	function sumAfters(index: number): number {
		if (index === 0) return 0
		let counter = 0
		while (index !== 0) {
			counter += form.items[index].questions.length
			index -= 1
		}
		return counter
	}
</script>

<Form>
	{#each form.items as item, i}
		<h3>{intToRoman(i + 1)}. {item.title}</h3>
		{#each item.questions as question, j}
			<Question
				statusWork={work.status}
				{answers}
				{token}
				{idWork}
				after={sumAfters(i)}
				number={j + 1}
				bind:question
			/>
		{/each}
	{/each}
	<div slot="questions" class="Questions">
		{#if work.wtime && work.status === 'opened'}
			<span>{seconds}</span>
		{/if}
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
		{#if work.status === 'opened'}
			<ButtonText color={'white'} click={toggleModal}
				><i class="fa-solid fa-flag" /> Finalizar formulario</ButtonText
			>
		{/if}
		{#if work.status === 'revised'}
			<span>{points.total_points}/{points.max_points} Pts.</span>
		{/if}
	</div>
</Form>

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Cerrar formulario</h2>
		<span>¿Est&aacute;s seguro de cerrar el formulario?</span>
		<div class="Buttons">
			<ButtonText click={finishForm}>S&iacute;, cerrar formulario</ButtonText>
			<ButtonText click={toggleModal}>No, no cerrar formulario</ButtonText>
		</div>
	</Modal>
{/if}

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

	.Questions span {
		color: white;
	}

	i {
		color: white;
	}

	span {
		text-align: center;
	}

	.Buttons {
		display: flex;
	}
</style>
