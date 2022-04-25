<script lang="ts">
	export let classItem: string
	export let title = ''
	export let href: string
</script>

<a {href} {title}> <i class={classItem} /></a>

<style>
	a {
		background: transparent;
		border: none;
	}

	a:hover i {
		color: var(--color-main);
	}

	i {
		font-size: 1rem;
		transition: all 0.4s ease;
	}
</style>
