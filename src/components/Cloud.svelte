<script lang="ts">
	import { variables } from '$lib/variables'
	import type { UserFiles } from '$models/users/files.model'

	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'

	import { onMount } from 'svelte'
	import File from './Classroom/File.svelte'

	import AIcon from './HTML/AIcon.svelte'
	import Modal from './Modal.svelte'
	import SpinnerGet from './SpinnerGet.svelte'

	export let modal = false
	export let token: string
	export let filesAttached: Array<UserFiles>
	// Modal
	const toggleModal = () => (modal = !modal)
	// Data
	let files: Array<UserFiles>

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_FILES}/api/files/get_files`,
				true,
				token,
			)
			files = dataFetch.body
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function addFile(index: number) {
		if (!filesAttached.some((f) => f === files[index]))
			filesAttached = [...filesAttached, files[index]]
	}
</script>

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title"><i class="fa-solid fa-cloud" /> Tus archivos</h2>
		{#if files}
			<section class="Files">
				{#each files as file, i}
					<div class="File" on:click={() => addFile(i)}>
						<File canDownload={false} {file} />
					</div>
				{:else}
					<span>No tienes archivos...</span>
				{/each}
			</section>
		{:else}
			<SpinnerGet />
		{/if}
		<br />
		<AIcon
			title={'Administrar archivos'}
			href={'/usuario/archivos'}
			classItem={'fa-solid fa-cloud-arrow-up'}
		/>
	</Modal>
{/if}

<style>
	.Files {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
	}

	.File {
		width: 100%;
		max-width: 500px;
	}
</style>
