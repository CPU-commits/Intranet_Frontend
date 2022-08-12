<script lang="ts">
	type Function = (...any: any) => any

	export let value: string
	export let search: Function
	export let placeholder = 'Buscar'

	import Input from './Input.svelte'
</script>

<div class="Search">
	<button on:click={search}>
		<i class="fa-solid fa-magnifying-glass" />
	</button>
	<Input keyup={search} {placeholder} bind:value type={'search'} id={'search'} />
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
