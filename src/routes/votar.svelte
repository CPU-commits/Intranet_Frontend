<script context="module">
	export function load({ session }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
			},
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation'

	import Button from '$components/HTML/Button.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Table from '$components/HTML/Table.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { Voting } from '$models/admin/voting.model'

	import { voting } from '$stores/stores'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'

	export let token: string
	// Data
	let votingData: Voting
	// Form
	let vote: string
	let myVote: boolean

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(`${variables.API}/api/students/get_voting`, false, token),
				API.fetchGetData(`${variables.API}/api/students/get_my_vote`, false, token),
			])
			votingData = dataFetch[0].body.voting
			myVote = dataFetch[1].body.my_vote != null
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function voteForList() {
		try {
			if (!vote) throw new Error('Debe seleccionar una lista a votar')
			await API.fetchData(
				'post',
				`${variables.API}/api/students/vote/${vote}`,
				undefined,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha votado satisfactoriamente',
				type: 'success',
			})
			goto('/inicio')
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="Voting">
	{#if $voting === 'waiting'}
		<SpinnerGet />
	{:else if myVote}
		<h2>Votaciones</h2>
		<span>Ya se realiz&oacute; un voto</span>
		<img src="/img/voting.svg" alt="Votaciones" />
	{:else if $voting === 'in progress'}
		<h2>Votaciones</h2>
		{#if votingData}
			<Form form={voteForList}>
				<h3><i class="fa-solid fa-rectangle-list" /> Listas de estudiantes</h3>
				{#each votingData.lists as list, i}
					<article class="List">
						<header class="List__header">
							<span>{i + 1})</span>
							<h3>{list.list_name}</h3>
							<input type="radio" value={list._id} bind:group={vote} />
						</header>
						<h4>
							<i class="fa-solid fa-people-group" />
							Miembros
						</h4>
						<Table header={['Estudiante', 'Rol']}>
							{#each list.students as student}
								<tr>
									<td>
										{student._id.name}
										{student._id.first_lastname}
										{student._id.second_lastname}
									</td>
									<td>
										{student.rol}
									</td>
								</tr>
							{/each}
						</Table>
					</article>
				{/each}
				<Button type={'submit'}>
					<span class="ButtonVote">
						<i class="fa-solid fa-check-to-slot" /> Votar
					</span>
				</Button>
			</Form>
		{:else}
			<SpinnerGet />
		{/if}
	{:else}
		<h2>Votaciones cerradas</h2>
		<img src="/img/voting.svg" alt="Votaciones" />
	{/if}
</section>

<style>
	.Voting {
		background-color: white;
		box-shadow: var(--box-shadow);
		margin: 30px;
		padding: 15px;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 15px;
	}

	h2 {
		color: var(--color-main);
	}

	img {
		max-height: 300px;
	}

	.List {
		padding: 15px;
	}

	.List__header {
		display: flex;
		gap: 5px;
		align-items: center;
	}

	h4 {
		margin-top: 10px;
		display: flex;
		gap: 5px;
		align-items: center;
	}

	.ButtonVote {
		font-weight: bold;
		color: white;
	}

	.ButtonVote i {
		color: white;
	}
</style>
