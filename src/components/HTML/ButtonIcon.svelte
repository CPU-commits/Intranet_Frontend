<script lang="ts">
	export let classItem: string
</script>

<button type="button"> <i class={classItem} /></button>

<style>
	button {
		background: transparent;
		border: none;
	}

	button:hover i {
		color: var(--color-main);
	}

	i {
		font-size: 1rem;
		transition: all 0.4s ease;
	}
</style>
