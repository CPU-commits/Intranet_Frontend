<script lang="ts">
	export let value: string
	export let search

	import Input from './Input.svelte'
</script>

<div class="Search">
	<button on:click={search}>
		<i class="fa-solid fa-magnifying-glass" />
	</button>
	<Input keyup={search} placeholder={'Buscar'} bind:value type={'text'} id={'search'} />
</div>

<style lang="scss">
	.Search {
		display: flex;
		align-items: center;
	}

	button {
		background-color: var(--color-main);
		border: none;
		height: 36px;
		width: 36px;
		border-top-left-radius: 8px;
	}

	i {
		color: white;
	}
</style>
