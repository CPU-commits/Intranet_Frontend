<script lang="ts">
	export let value
	export let type
	export let id
	export let placeholder = ''

	function typeAction(node) {
		node.type = type
	}
</script>

<input bind:value {id} use:typeAction {placeholder} />

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
