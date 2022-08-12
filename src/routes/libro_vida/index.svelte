<script context="module">
	export function load({ session }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
				user_type: session.user.user_type,
			},
		}
	}
</script>

<script lang="ts">
	import Booklife from '$components/Booklife/Booklife.svelte'
	import AIcon from '$components/HTML/AIcon.svelte'
	import Search from '$components/HTML/Search.svelte'
	import Table from '$components/HTML/Table.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { Student } from '$models/admin/student.model'
	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'

	export let token: string
	export let user_type: string
	let search: string
	let students: Array<Student> = []
	let spinner = false

	async function getStudents() {
		try {
			spinner = true
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/students/get_students?search=${search}&actived=true`,
				true,
				token,
			)
			students = dataFetch.body.users
			spinner = false
		} catch (err) {
			students = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="BookLife">
	<h2>Libro de vida</h2>
	{#if user_type !== UserTypes.STUDENT && user_type !== UserTypes.STUDENT_DIRECTIVE}
		<Search placeholder={'Buscar alumno'} search={getStudents} bind:value={search} />
		<br />
		{#if !spinner}
			<Table header={['Rut', 'Nombre', 'Curso', 'Libro de vida']}>
				{#each students as student}
					<tr>
						<td>{student.rut}</td>
						<td>{student.name} {student.first_lastname}</td>
						<td>{student.course.course.course} {student.course.section}</td>
						<td>
							<AIcon
								href={`/libro_vida/${student._id}`}
								classItem={'fa-solid fa-book-open'}
							/>
						</td>
					</tr>
				{:else}
					<td>No hay alumnos...</td>
				{/each}
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
	{:else}
		<Booklife {token} />
	{/if}
</section>

<style>
	.BookLife {
		margin: 20px;
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
		border-radius: 15px;
	}

	h2 {
		margin-bottom: 15px;
	}
</style>
