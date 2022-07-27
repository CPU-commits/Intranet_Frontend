<script lang="ts">
	export let value: any
	export let id: string = ''
	export let type = 'text'
	export let placeholder = ''
	export let keyup = () => {}

	function typeAction(node) {
		node.type = type
	}
</script>

<input
	class:Color={type === 'color'}
	on:keyup={keyup}
	bind:value
	{id}
	use:typeAction
	{placeholder}
/>

<style lang="scss">
	input {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		background-color: transparent;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
	}

	input:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}

	.Color {
		padding: 0;
	}
</style>
