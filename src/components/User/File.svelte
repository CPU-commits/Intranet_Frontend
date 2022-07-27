<script lang="ts">
	import { variables } from '$lib/variables'

	import type { UserFiles } from '$models/users/files.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import downloadFileURL from '$utils/downloadFileURL'
	import { formatDate } from '$utils/format'
	import { getIcon } from '$utils/getIcon'

	export let file: UserFiles
	export let token: string
	export let date: string

	async function downloadFile() {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_FILES}/api/files/get_file/${file._id.$oid}`,
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
</script>

<button on:click={downloadFile} title={file.title}>
	<article class="File">
		<div class="File__icon">
			<i class={getIcon(file.type)} />
		</div>
		<div class="File__text">
			<h3>{file.title}</h3>
			<small>
				{file.filename}
				{formatDate(date ? date : file.date)}
			</small>
		</div>
	</article>
</button>

<style lang="scss">
	button {
		border: none;
		background: transparent;
	}

	button:hover h3 {
		color: var(--color-main);
	}

	.File {
		width: fit-content;
		display: flex;
		min-width: 300px;
	}

	.File__icon {
		background-color: var(--color-main);
		padding: 20px;
		border-top-left-radius: 10px;
		border-bottom-left-radius: 10px;
		i {
			color: white;
			font-size: 1rem;
		}
	}

	.File__text {
		border: 2px solid var(--color-light);
		border-left: none;
		padding: 5px;
		display: flex;
		width: 100%;
		flex-direction: column;
		justify-content: flex-start;
		h3 {
			font-size: 1.1rem;
			transition: all 0.4s ease;
		}
	}
</style>
