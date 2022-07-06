<script lang="ts">
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import { variables } from '$lib/variables'

	import type { UserFiles } from '$models/users/files.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import downloadFileURL from '$utils/downloadFileURL'
	import { formatDate } from '$utils/format'
	import { getIcon } from '$utils/getIcon'

	type DeleteMe = (index: number) => void

	export let file: UserFiles
	export let edit: boolean = false
	export let moduleId: string = ''
	export let token: string = ''
	export let canDownload: boolean = true
	export let deleteMe: DeleteMe = null

	async function downloadFile() {
		if (canDownload) {
			try {
				const dataFetch = await API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/modules/download_file/${file._id}/${moduleId}`,
					true,
					token,
				)
				downloadFileURL(dataFetch.body.token)
			} catch (err) {
				addToast({
					message: err.message,
					type: 'error',
				})
			}
		}
	}
</script>

<article class="File">
	<div class="File__container" on:click={downloadFile}>
		<header>
			<i class={getIcon(file.type)} />
		</header>
		<div class="File__content">
			<h3>{file.title}</h3>
			<small>{formatDate(file.date)}</small>
		</div>
	</div>
	{#if edit}
		<aside>
			<ButtonIcon clickFunction={deleteMe} classItem={'fa-solid fa-xmark'} />
		</aside>
	{/if}
</article>

<style>
	.File {
		width: 100%;
		border: 2px solid var(--color-light);
		border-radius: 5px;
		max-width: 500px;
		cursor: pointer;
		position: relative;
	}

	.File__container {
		display: flex;
		align-items: center;
	}

	.File__container:hover h3 {
		color: var(--color-main);
	}

	header {
		padding: 14px;
		border-right: 2px solid var(--color-light);
	}

	h3 {
		transition: all 0.4s ease;
	}

	i {
		color: var(--color-main);
		font-size: 1.4rem;
	}

	.File__content {
		display: flex;
		flex-direction: column;
		padding: 10px;
		width: 100%;
	}

	aside {
		position: absolute;
		right: 10px;
		top: 20px;
	}
</style>
