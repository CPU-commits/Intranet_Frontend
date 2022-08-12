<script lang="ts">
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import { variables } from '$lib/variables'
	import type { Author } from '$models/library/author.model'

	import type { Book } from '$models/library/book.model'
	import type { Editorial } from '$models/library/editorial.model'
	import type { Tag } from '$models/library/tag.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import Rating from './Rating.svelte'

	export let book: Book & {
		tags: Array<Tag>
		author: Author
		editorial: Editorial
	}
	export let token: string

	async function saveBook() {
		try {
			await API.fetchData(
				'post',
				`${variables.API_LIBRARY}/api/books/save_book/${book._id}`,
				undefined,
				true,
				undefined,
				token,
			)
			book.is_saved = !book.is_saved
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<article class="Book">
	<a href="/biblioteca/libro/{book.slug}">
		<header>
			<h2>{book.name}</h2>
			<img src={book.image.url} alt={book.name} />
		</header>
	</a>
	<section class="Ranking">
		<Rating stars={book.ranking ? book.ranking : 0} />
	</section>
	<footer>
		<section class="Tags">
			<i class="fa-solid fa-tags" />
			{#each book.tags as tag, i}
				<small>{tag.tag} {i + 1 !== book.tags.length ? '-' : ''}</small>
			{/each}
		</section>
		<small>Autor: <span class="Author">{book.author.name}</span></small>
		<small>
			<i title="Publicador/editorial" class="fa-solid fa-bullhorn" />
			{book.editorial.editorial}
		</small>
	</footer>
	<aside>
		<ButtonIcon
			selected={book.is_saved}
			classItem={'fa-solid fa-bookmark'}
			clickFunction={saveBook}
		/>
	</aside>
</article>

<style>
	a {
		text-decoration: none;
	}

	.Book {
		background-color: white;
		box-shadow: var(--box-shadow);
		max-width: 250px;
		width: 100%;
		padding: 15px;
		border-radius: 8px;
		position: relative;
		transition: all 0.4s;
	}

	.Book:hover {
		box-shadow: none;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	header img {
		height: 250px;
		width: 180px;
		align-self: center;
		border: 2px solid var(--color-light);
		object-fit: cover;
	}

	.Tags {
		display: flex;
		align-items: center;
		gap: 5px;
		flex-wrap: wrap;
	}

	i {
		color: var(--color-main);
	}

	.Ranking {
		display: flex;
		margin-top: 10px;
		justify-content: center;
	}

	footer {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
	}

	.Author {
		color: var(--color-main);
		font-weight: bold;
	}

	aside {
		position: absolute;
		right: 10px;
		bottom: 10px;
	}
</style>
