<script lang="ts">
	export let classItem: string
	export let title = ''
	export let href: string
	export let active = false
	export let target = ''
</script>

<a {target} data-sveltekit-prefetch class:Actived={active} {href} {title}>
	<i class={classItem} /></a
>

<style>
	a {
		display: flex;
		justify-content: center;
		text-decoration: none;
		background: transparent;
		border: none;
		width: 100%;
	}

	a:hover i {
		color: var(--color-main);
	}

	i {
		font-size: 1rem;
		transition: all 0.4s ease;
	}

	.Actived i {
		color: var(--color-main);
	}
</style>
