<script lang="ts">
	export let header: string[]
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
