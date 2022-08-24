<script lang="ts">
	import { onMount } from 'svelte'
	import { beforeUpdate } from 'svelte'

	export let classItem: string
	export let title = ''
	export let clickFunction: any
	export let color: string = null
	export let selected: boolean = false
	export let hover: string = 'var(--color-main)'

	let btn: HTMLButtonElement

	onMount(() => {
		if (color) btn.style.setProperty('--color-i', color)
		if (hover) btn.style.setProperty('--hover-i', hover)
	})

	beforeUpdate(() => {
		if (btn) btn.style.setProperty('--color-i', color)
	})
</script>

<button class:Selected={selected} bind:this={btn} {title} on:click={clickFunction} type="button">
	<i class={classItem} />
	<span class="Text">
		<slot />
	</span>
</button>

<style>
	button {
		background: transparent;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button:hover i,
	button:hover .Text {
		color: var(--hover-i);
	}

	i,
	.Text {
		font-size: 1rem;
		transition: all 0.4s ease;
		color: var(--color-i);
	}

	.Selected {
		color: var(--color-main) !important;
	}
</style>
