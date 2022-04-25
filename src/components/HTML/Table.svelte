<script lang="ts">
	export let header: string[]
</script>

<table>
	<thead>
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

<style>
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
