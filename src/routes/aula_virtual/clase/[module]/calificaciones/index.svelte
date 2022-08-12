<script context="module" lang="ts">
	export function load({ session, params }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
				name: session.user.name,
				user_type: session.user.user_type,
				idModule: params.module,
			},
		}
	}
</script>

<script lang="ts">
	import Student from '$components/Classroom/Grades/Student.svelte'
	import Teacher from '$components/Classroom/Grades/Teacher.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { GradeProgram } from '$models/classroom/grade.model'
	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	export let token: string
	export let name: string
	export let user_type: string
	export let idModule: string

	let gradePrograms: Array<GradeProgram>

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/grades/get_grade_programs/${idModule}`,
					true,
					token,
				),
			])
			gradePrograms = dataFetch[0].body.programs
		} catch (err) {
			gradePrograms = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<section class="Grades">
	{#if gradePrograms}
		{#if user_type === UserTypes.STUDENT}
			<Student {gradePrograms} {idModule} {token} />
		{:else}
			<Teacher {name} {gradePrograms} {token} {idModule} />
		{/if}
	{:else}
		<SpinnerGet />
	{/if}
</section>

<style>
	.Grades {
		margin: 20px;
		padding: 15px;
		border-radius: 10px;
		background-color: white;
		box-shadow: var(--box-shadow);
	}
</style>
