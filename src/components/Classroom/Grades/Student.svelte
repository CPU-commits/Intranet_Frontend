<script lang="ts">
	import Table from '$components/HTML/Table.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { GradeProgram } from '$models/classroom/grade.model'
	import type { GradeSee } from '$models/classroom/student_grade.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { formatDate } from '$utils/format'
	import { onMount } from 'svelte'

	export let gradePrograms: Array<GradeProgram>
	export let idModule: string
	export let token: string

	let grades: Array<GradeSee>

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/grades/get_student_grades/${idModule}`,
				true,
				token,
			)
			grades = dataFetch.body.grades
		} catch (err) {
			grades = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<section class="Grades">
	<h2>Calificaciones</h2>
	{#if grades}
		<Table header={['Calificación', 'N°', 'Calificador', 'Fecha']}>
			{#each grades as grade, i}
				{#if !grade.is_acumulative}
					<tr>
						<td>{grade.grade}</td>
						<td>{gradePrograms[i].number}</td>
						<td>{grade.evaluator.name} {grade.evaluator.first_lastname}</td>
						<td>{formatDate(grade.date)}</td>
					</tr>
				{:else}
					{#each grade.acumulative as acumulative, j}
						<tr>
							<td>{acumulative.grade}</td>
							<td
								>{gradePrograms[i].number}
								(Acu: {gradePrograms[i].acumulative[j].number})</td
							>
							<td
								>{acumulative.evaluator.name}
								{acumulative.evaluator.first_lastname}</td
							>
							<td>{formatDate(acumulative.date)}</td>
						</tr>
					{/each}
				{/if}
			{:else}
				<span>No hay calificaciones...</span>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
	<br />
	<h3><i class="fa-solid fa-robot" /> Programaci&oacute;n de calificaciones</h3>
	{#if gradePrograms}
		<Table header={['N°', 'Porcentaje', 'Acumulativo']}>
			{#each gradePrograms as program}
				<tr>
					<td>{program.number}</td>
					<td>{program.percentage}%</td>
					<td>
						{!program.is_acumulative
							? 'No aplica'
							: program.acumulative
									.map(
										(acumulative) =>
											`${acumulative.number}°[${acumulative.percentage}%] `,
									)
									.join('')}
					</td>
				</tr>
			{:else}
				<span>Todav&iacute;a ninguna programaci&oacute;n</span>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</section>

<style>
	h3 {
		margin-top: 10px;
	}

	i {
		color: var(--color-main);
	}
</style>
