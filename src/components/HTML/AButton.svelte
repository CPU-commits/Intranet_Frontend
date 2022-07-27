<script lang="ts">
	export let href: string
	export let prefetch = true
</script>

{#if prefetch}
	<a {href} sveltekit:prefetch>
		<slot />
	</a>
{:else}
	<a {href}>
		<slot />
	</a>
{/if}

<style lang="scss">
	a {
		width: 100%;
		padding: 8px;
		text-decoration: none;
		background-color: var(--color-main);
		border: none;
		color: white;
		transition: all 0.3s ease;
		border-radius: 5px;
	}

	a:hover {
		-webkit-box-shadow: 3px 3px 0 1.5px #3134e1;
		-moz-box-shadow: 3px 3px 0 1.5px #3134e1;
		box-shadow: 3px 3px 0 1.5px #3134e1;
	}
</style>
