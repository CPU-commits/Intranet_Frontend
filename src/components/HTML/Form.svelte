<script lang="ts">
	export let form: (...any: any) => void = null
	export let formPage: {
		method: 'POST'
		action: string
	} = null
</script>

{#if form}
	<form class="Form" on:submit|preventDefault={form}>
		<slot />
	</form>
{:else}
	<form class="Form" method={formPage.method} action={formPage.action}>
		<slot />
	</form>
{/if}

<style>
	.Form {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 15px;
	}
</style>
