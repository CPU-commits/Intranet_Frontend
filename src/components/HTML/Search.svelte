<script>
	export let value

	import Button from './Button.svelte'
	import Input from './Input.svelte'
</script>

<div class="Search">
	<button>
		<i class="fa-solid fa-magnifying-glass" />
	</button>
	<Input placeholder={'Buscar'} {value} type={'text'} id={'search'} />
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
