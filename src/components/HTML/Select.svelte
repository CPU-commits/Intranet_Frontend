<script lang="ts">
	export let value
	export let id: string
</script>

<select bind:value {id}>
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
	}

	select:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}
</style>
