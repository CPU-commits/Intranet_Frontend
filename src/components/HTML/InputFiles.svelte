<script lang="ts">
	import { addToast } from '$stores/toasts'

	type Filter = {
		filter: boolean
		type?: string
		message?: string
	}

	export let files: FileList
	export let id: string
	export let accept = '*'
	export let filter: Filter = {
		filter: false,
	}
	export let onChange: () => void = null
	export let multiple = false

	function onFileSelected(e) {
		if (filter.filter) {
			let image = e.target.files[0]
			if (!image?.type?.includes(filter.type)) {
				addToast({
					message: filter.message,
					type: 'error',
				})
				return
			}
		}
		if (onChange) onChange()
	}
</script>

<input {multiple} {accept} bind:files type="file" {id} on:change={onFileSelected} />

<style lang="scss">
	input {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
	}

	input:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}
</style>
