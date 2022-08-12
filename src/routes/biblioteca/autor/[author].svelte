<script context="module">
	import { variables } from '$lib/variables'

	import API from '$utils/APIModule'

	export async function load({ session, params }) {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_LIBRARY}/api/authors/get_author/${params.author}`,
				false,
				session.user.token,
			)
			return {
				status: 200,
				props: {
					author: dataFetch.body.author,
				},
			}
		} catch (err) {
			return {
				status: err.statusCode,
				error: err.message,
			}
		}
	}
</script>

<script lang="ts">
	import TableSmall from '$components/HTML/TableSmall.svelte'
	import type { Author } from '$models/library/author.model'
	import { urlify } from '$utils/format'

	export let author: Author
</script>

<section class="Author">
	<section class="Author__top">
		<header>
			<h1>{author.name}</h1>
			<pre>{author.biography}</pre>
		</header>
		<picture>
			<img src={author.image.url} alt={author.name} />
			<TableSmall>
				{#each author.table_info as item}
					<tr>
						<td>{item.key}</td>
						<td>{item.value}</td>
					</tr>
				{/each}
			</TableSmall>
		</picture>
	</section>
	<h3>Datos curiosos</h3>
	{#each author.fun_facts as fact}
		<details>
			<summary>{fact.title}</summary>
			<pre>{fact.fact}</pre>
		</details>
	{/each}
	<h3><i class="fa-solid fa-book-atlas" /> Referencias</h3>
	<ol>
		{#each author.references as reference}
			<li>{@html urlify(reference)}</li>
		{:else}
			<span>Sin referencias...</span>
		{/each}
	</ol>
</section>

<style>
	.Author {
		margin: 20px;
		padding: 20px;
		background-color: white;
		border-radius: 15px;
		box-shadow: var(--box-shadow);
		box-sizing: border-box;
	}

	h1 {
		font-size: 1.7rem;
	}

	h3 {
		margin-top: 10px;
	}

	.Author__top {
		display: grid;
		grid-template-columns: 1fr 200px;
		gap: 20px;
	}

	.Author__top header {
		width: 100%;
	}

	.Author__top img {
		width: 200px;
		border: 2px solid var(--color-light);
		height: 200px;
		object-fit: cover;
	}

	pre {
		padding: 10px;
		border-bottom: 2px solid var(--color-light);
	}

	details {
		padding: 8px;
	}

	ol {
		padding: 15px;
	}
</style>
