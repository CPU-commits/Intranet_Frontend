<script lang="ts">
	// Exports
	export let file: UserFiles
	export let token: string

	// Types
	import type { UserFiles } from '$models/users/files.model'
	import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
	// Stores
	import { addToast } from '$stores/toasts'
	// Utils
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import downloadFileURL from '$utils/downloadFileURL'
	import { getIcon } from '$utils/getIcon'

	async function downloadFile() {
		try {
			const dataFetch: FetchResponse<{ token: string }> = await API.fetchGetData(
				`${variables.API_FILES}/api/files/get_file/${file._id}`,
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

<article class="FileMin" on:click={downloadFile}>
	<i class={getIcon(file.type)} />
	<small>{file.title}</small>
</article>

<style>
	.FileMin {
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		width: fit-content;
	}

	.FileMin i {
		font-size: 1.1rem;
	}

	.FileMin:hover small,
	.FileMin:hover i {
		color: var(--color-main);
	}

	.FileMin small,
	i {
		transition: all 0.4s;
	}
</style>
