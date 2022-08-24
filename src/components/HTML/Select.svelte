<script lang="ts">
	export let value: any
	export let id: string
	export let change: (...any: any) => any = null
	export let dataId = ''
</script>

<select data-id={dataId} bind:value {id} on:change={change}>
	<slot />
</select>

<style lang="scss">
	select {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
		background-color: transparent;
	}

	select:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}
</style>
