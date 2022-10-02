<script lang="ts">
	type Navigate = {
		activate: boolean
		fn?: (n: number) => void
		max?: number
	}
	export let navigate: Navigate
	export let total: number = 0

	$: pages = Math.ceil(total / navigate?.max)

	let selected: number = 0

	function setSelected(toSet: number) {
		navigate.fn(toSet)
		selected = toSet
	}
</script>

<nav class="Table__nav">
	<button on:click={() => setSelected(0)} disabled={selected === 0}>
		<i class="fa-solid fa-angles-left" />
	</button>
	<button on:click={() => setSelected(selected - 1)} disabled={selected === 0}>
		<i class="fa-solid fa-angle-left" />
	</button>
	{#each Array(pages > 5 ? 5 : pages) as _, i}
		{@const index = pages > 5 ? (selected + 4 > pages - 1 ? i + 3 : i + selected) : i}
		<button on:click={() => setSelected(index)} class:Selected={index === selected}>
			{index + 1}
		</button>
	{/each}
	{#if selected + 5 < pages}
		<span><i class="fa-solid fa-ellipsis" /></span>
	{/if}
	<button
		on:click={() => setSelected(selected + 1)}
		disabled={pages === selected + 1 || pages === 0}
	>
		<i class="fa-solid fa-angle-right" />
	</button>
	<button
		on:click={() => setSelected(pages - 1)}
		disabled={pages === selected + 1 || pages === 0}
	>
		<i class="fa-solid fa-angles-right" />
	</button>
</nav>

<style>
	.Table__nav {
		margin-top: 10px;
		display: flex;
		gap: 5px;
		justify-content: center;
		align-items: flex-end;
		flex-wrap: wrap;
	}

	.Selected {
		background-color: var(--color-main) !important;
		color: white !important;
	}

	.Table__nav button {
		background-color: white;
		border: none;
		width: 25px;
		height: 25px;
		color: var(--color-main);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button:disabled,
	button:disabled i {
		color: var(--color-light) !important;
	}

	i {
		color: var(--color-main);
	}
</style>
