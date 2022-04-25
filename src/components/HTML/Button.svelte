<script>
	export let type
	export let click = () => {}
</script>

<button on:click={click} {type}>
	<slot />
</button>

<style lang="scss">
	button {
		width: 100%;
		padding: 8px;
		background-color: var(--color-main);
		border: none;
		color: white;
		transition: all 0.3s ease;
		border-radius: 5px;
	}

	button:hover {
		-webkit-box-shadow: 3px 3px 0 1.5px #3134e1;
		-moz-box-shadow: 3px 3px 0 1.5px #3134e1;
		box-shadow: 3px 3px 0 1.5px #3134e1;
	}
</style>
