<script lang="ts">
	export let files: any
	export let id: string
</script>

<input bind:files type="file" {id} />

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
