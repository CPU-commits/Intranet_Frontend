<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { GradeProgram } from '$models/classroom/grade.model'
	import type { Session } from '$models/session.model'
	import { UserTypes } from '$models/users/user_type.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import Student from '$components/Classroom/Grades/Student.svelte'
	import Teacher from '$components/Classroom/Grades/Teacher.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	// Init variables
	let token = data.user.token
	let name = data.user.name
	let user_type = data.user.user_type
	let idModule = $page.params.module
	// Data
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
