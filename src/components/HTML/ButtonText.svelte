<script lang="ts">
	import { onMount } from 'svelte'

	type Function = (...any: any) => any

	export let click: Function
	export let color: string = 'var(--color-main)'

	let button: HTMLButtonElement

	onMount(() => {
		button.style.setProperty('--color-button', color)
	})
</script>

<button bind:this={button} on:click={click} type="button">
	<slot />
</button>

<style lang="scss">
	button {
		width: 100%;
		padding: 8px;
		font-size: 1rem;
		border: none;
		background-color: transparent;
		color: var(--color-button);
		transition: all 0.3s ease;
		border-radius: 5px;
	}
</style>
