<script lang="ts">
	export let title = ''
	export let clickFunction: any
	export let selected: boolean = false
	export let disabled: boolean = false
</script>

<button
	class="RichButton"
	{disabled}
	class:RichButtonSelected={selected}
	{title}
	on:click={clickFunction}
	type="button"
>
	<slot />
</button>

<style>
	button {
		background: transparent;
		border: none;
		display: flex;
		align-items: center;
		padding: 2px;
		justify-content: center;
		border-bottom: 2px solid transparent;
	}
</style>
