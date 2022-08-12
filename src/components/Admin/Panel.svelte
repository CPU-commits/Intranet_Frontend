<script lang="ts">
	import { onMount } from 'svelte'

	export let nav = true

	let content: HTMLElement

	onMount(() => {
		if (!nav) content.style.marginTop = '0px'
	})
</script>

<section class="Panel">
	{#if nav}
		<nav><slot name="nav" /></nav>
	{/if}
	<div bind:this={content} class="Panel__content">
		<slot />
	</div>
</section>

<style lang="scss">
	.Panel {
		width: 100%;
		box-shadow: var(--box-shadow);
		padding: 20px;
		border-radius: 10px;
		overflow: auto;
		background-color: white;
	}

	.Panel__content {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
	}

	nav {
		box-sizing: border-box;
		padding: 10px;
		width: 100%;
		border: 2px solid var(--color-main);
	}
</style>
