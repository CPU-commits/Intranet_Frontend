<script context="module">
	export function load({ params, session }) {
		return {
			status: 200,
			props: {
				year: params.year,
				token: session.user.token,
			},
		}
	}
</script>

<script lang="ts">
	import Panel from '$components/Admin/Panel.svelte'
	import Table from '$components/HTML/Table.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { Semester } from '$models/admin/semester.model'
	import type { Student } from '$models/admin/student.model'
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	export let year: string
	export let token: string

	// Data
	let semesters: Array<Semester>
	let semestersData = {
		first: {
			modules: [] as Array<ClassroomModules>,
			history: [],
		},
		second: {
			modules: [] as Array<ClassroomModules>,
			history: [],
			students: [] as Array<Student>,
		},
	}

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/semesters/get_semester_year/${year}`,
				false,
				token,
			)
			semesters = dataFetch.body.semesters
			// Get data from each semester
			const finishedSemesters = semesters.filter((semester) => {
				if (semester.status === 0) return semester
			})

			const promises = {
				first: {
					promises: [] as Array<Promise<FetchResponse>>,
				},
				second: {
					promises: [] as Array<Promise<FetchResponse>>,
				},
			}
			finishedSemesters.forEach((semester) => {
				if (semester.semester === 1) {
					promises.first.promises.push(
						API.fetchGetData(
							`${variables.API}/api/classroom/get_modules_semester/${semester._id}`,
							true,
							token,
						),
						API.fetchGetData(
							`${variables.API}/api/history/get_history?semester=${semester._id}`,
							true,
							token,
						),
					)
				} else {
					promises.second.promises.push(
						API.fetchGetData(
							`${variables.API}/api/classroom/get_modules_semester/${semester._id}`,
							true,
							token,
						),
						API.fetchGetData(
							`${variables.API}/api/history/get_history?semester=${semester._id}`,
							true,
							token,
						),
						API.fetchGetData(
							`${variables.API}/api/semesters/get_repeating_students/${semester._id}`,
							true,
							token,
						),
					)
				}
			})
			const dataFetchSemesters = await Promise.all([
				Promise.all(promises.first.promises),
				Promise.all(promises.second.promises),
			]).then((data) => {
				return {
					first:
						data[0].length > 0
							? {
									modules: data[0][0].body.modules,
									history: data[0][1].body.history,
							  }
							: null,
					second:
						data[1].length > 0
							? {
									modules: data[1][0].body.modules,
									history: data[1][1].body.history,
									students: data[1][2].body.students.students,
							  }
							: null,
				}
			})

			semestersData.first = dataFetchSemesters.first
			semestersData.second = dataFetchSemesters.second
		} catch (err) {
			semesters = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<Panel nav={false}>
	<h2><i class="fa-solid fa-folder-open" /> {year} - Archivado</h2>
	{#if semesters}
		{#each semesters as semester}
			<section class="Folder">
				<h3>
					{semester.year} - {semester.semester}° {semester.status === 2
						? 'Sin finalizar'
						: ''}
				</h3>
				{#if semester.status === 0}
					<h4><i class="fa-solid fa-box" /> M&oacute;dulos - Aula Virtual</h4>
					<Table header={[]} />
					<h4><i class="fa-solid fa-scroll" /> Acciones</h4>
					{#if semester.semester === 2}
						<h4><i class="fa-solid fa-repeat" /> Estudiantes repitentes</h4>
						<Table header={['Nombre', 'RUT']}>
							{#each semestersData.second.students as student}
								<tr>
									<td>{student.name} {student.first_lastname}</td>
									<td>{student.rut}</td>
								</tr>
							{:else}
								<tr>
									<td>Sin repitentes</td>
								</tr>
							{/each}
						</Table>
						<small>Repitentes totales: {semestersData.second.students.length}</small>
					{/if}
				{/if}
			</section>
		{/each}
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

<style>
	.Folder {
		padding: 10px;
		margin-top: 10px;
		border: 1px solid var(--color-light);
	}
</style>
