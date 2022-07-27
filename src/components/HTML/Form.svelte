<script lang="ts">
	export let form: (...any: any) => void
</script>

<form class="Form" on:submit|preventDefault={form}>
	<slot />
</form>

<style>
	.Form {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 15px;
	}
</style>
