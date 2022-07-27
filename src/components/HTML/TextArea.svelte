<script lang="ts">
	export let value: string
	export let placeholder = ''
	export let keydown: (...any: any) => void = null
</script>

<textarea on:keydown={keydown} bind:value {placeholder} />

<style lang="scss">
	textarea {
		resize: none;
		height: 70px;
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
	}

	textarea:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}
</style>
