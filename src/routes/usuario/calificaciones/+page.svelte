<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { page } from '$app/stores'
	import { addToast } from '$stores/toasts'
	// Components
	import User from '$components/User/User.svelte'
	// Utils
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import type { Semester } from '$models/admin/semester.model'
	import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
	import Table from '$components/HTML/Table.svelte'
	import Button from '$components/HTML/Button.svelte'
	import downloadFileURL from '$utils/downloadFileURL'
	import SpinnerGet from '$components/SpinnerGet.svelte'

	// Init variables
	let token = data.user.token
	let user_type = data.user.user_type
	$: url = $page.url.pathname

	// Data
	let semesters: Array<Semester> = []

	onMount(async () => {
		try {
			const dataFetch: FetchResponse<{ semesters: Array<Semester> }> = await API.fetchGetData(
				`${variables.API}/api/semesters/get_participated_semesters`,
				false,
				token,
			)
			semesters = dataFetch.body.semesters
		} catch (err) {
			semesters = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getGrades(idSemester: string) {
		try {
			const dataFetch: FetchResponse<ArrayBuffer> = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/grades/download_grades?semester=${idSemester}`,
				true,
				token,
				{
					responseType: 'arraybuffer',
					headers: {
						'content-type': 'application/json',
					},
				},
				true,
			)
			const blob = new Blob([dataFetch.body], {
				type: 'application/pdf',
			})
			const url = window.URL.createObjectURL(blob)
			downloadFileURL(url, `Calificaciones.pdf`)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<User {user_type} {url}>
	<h2 slot="title">Calificaciones</h2>
	{#if semesters}
		<Table header={['Semestre', 'Calificaciones']}>
			{#each semesters as semester}
				<tr>
					<td>{semester.year} {semester.semester}°</td>
					<td>
						<Button click={() => getGrades(semester._id)} type={'button'}>
							<i class="fa-solid fa-highlighter" />
						</Button>
					</td>
				</tr>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</User>

<style>
	i {
		color: white;
	}
</style>
