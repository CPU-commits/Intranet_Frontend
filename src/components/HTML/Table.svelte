<script lang="ts">
	import Nav from './Nav.svelte'

	type Navigate = {
		activate: boolean
		fn?: (n: number) => void
		max?: number
	}

	export let header: string[]
	export let navigate: Navigate = {
		activate: false,
	}
	export let total: number = 0
</script>

<section class="Table">
	<table>
		<thead class="Thead">
			<tr>
				{#each header as tdElement}
					<td>{@html tdElement}</td>
				{/each}
			</tr>
		</thead>
		<tbody class="Tbody">
			<slot />
		</tbody>
	</table>
</section>

{#if navigate.activate}
	<Nav {navigate} bind:total />
{/if}

<style>
	.Table {
		overflow-x: auto;
		width: 100%;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	tr {
		text-align: center;
	}

	tr td {
		color: var(--color-main);
		font-weight: 700;
	}
</style>
