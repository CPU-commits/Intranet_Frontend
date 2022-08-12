<script lang="ts">
	export let stars: number
</script>

<div class="Rating" title={stars === 0 ? 'Sin opiniones' : ''}>
	{#each Array(5) as _, i}
		<i class:Without={stars === 0} class:Star={i < stars} class="fa-solid fa-star" />
	{/each}
</div>

<style>
	.Rating {
		display: flex;
		gap: 5px;
	}

	.Star {
		color: var(--color-star);
	}

	.Without {
		color: var(--color-light);
	}
</style>
