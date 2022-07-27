<script context="module" lang="ts">
	export function load({ session, params }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
				user_type: session.user.user_type,
				idModule: params.module,
			},
		}
	}
</script>

<script lang="ts">
	import Student from '$components/Classroom/Grades/Student.svelte'
	import Teacher from '$components/Classroom/Grades/Teacher.svelte'
	import { UserTypes } from '$models/users/user_type.model'

	export let token: string
	export let user_type: string
	export let idModule: string
</script>

<section class="Grades">
	{#if user_type === UserTypes.STUDENT}
		<Student />
	{:else}
		<Teacher {token} {idModule} />
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
