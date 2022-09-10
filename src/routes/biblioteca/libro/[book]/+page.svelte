<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		book: BookWContent
	}

	// Types
	import type { Book } from '$models/library/book.model'
	import type { Tag } from '$models/library/tag.model'
	import type { Author } from '$models/library/author.model'
	import type { Editorial } from '$models/library/editorial.model'
	import type { Session } from '$models/session.model'

	type BookWContent = {
		tags: Array<Tag>
		author: Author
		editorial: Editorial
	} & Book
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Rating from '$components/Library/Rating.svelte'
	import Button from '$components/HTML/Button.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import downloadFileURL from '$utils/downloadFileURL'

	let token = data.user.token
	let book: BookWContent = data.book
	let opinion = ''

	function downloadBook() {
		downloadFileURL(book.book.url)
	}

	async function uploadRanking() {
		try {
			await API.fetchData(
				'post',
				`${variables.API_LIBRARY}/api/books/rank_book/${book._id}`,
				{ ranking: opinion },
				true,
				undefined,
				token,
			)
			addToast({
				message: '¡Gracias por tu opinión!',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="Book">
	<section class="Header">
		<figure class="Header__image">
			<img src={book.image.url} alt={book.name} />
			<Rating stars={book.ranking ? book.ranking : 0} />
			<a target="_blank" href="/biblioteca/autor/{book.author.slug}">
				Autor: <span class="Author">{book.author.name}</span>
			</a>
			<section class="Tags">
				<i class="fa-solid fa-tags" />
				{#each book.tags as tag, i}
					<small>{tag.tag} {i + 1 !== book.tags.length ? '-' : ''}</small>
				{/each}
			</section>
		</figure>
		<article class="Header__essentials">
			<h1>{book.name}</h1>
			<pre>{book.synopsis}</pre>
			<div class="BookFile">
				<Button type={'button'} click={downloadBook}>
					<i class="fa-solid fa-file-arrow-down" />
					Descargar libro
				</Button>
			</div>
			<h3>¿Qu&eacute; te parece {book.name}?</h3>
			<div class="Rating">
				<input
					bind:group={opinion}
					on:change={uploadRanking}
					value="5"
					type="radio"
					name="rate"
					id="rate-5"
				/>
				<label class="fas fa-star" for="rate-5" />
				<input
					bind:group={opinion}
					on:change={uploadRanking}
					value="4"
					type="radio"
					name="rate"
					id="rate-4"
				/>
				<label class="fas fa-star" for="rate-4" />
				<input
					bind:group={opinion}
					on:change={uploadRanking}
					value="3"
					type="radio"
					name="rate"
					id="rate-3"
				/>
				<label class="fas fa-star" for="rate-3" />
				<input
					bind:group={opinion}
					on:change={uploadRanking}
					value="2"
					type="radio"
					name="rate"
					id="rate-2"
				/>
				<label class="fas fa-star" for="rate-2" />
				<input
					bind:group={opinion}
					on:change={uploadRanking}
					value="1"
					type="radio"
					name="rate"
					id="rate-1"
				/>
				<label class="fas fa-star" for="rate-1" />
			</div>
		</article>
	</section>
	<footer>
		<h5>Editorial</h5>
		<img src={book.editorial.image.url} alt={book.editorial.editorial} />
	</footer>
</section>

<style>
	.Book {
		background-color: white;
		margin: 20px;
		border-radius: 15px;
		box-shadow: var(--box-shadow);
		padding: 15px;
	}

	h1 {
		font-size: 1.6rem;
	}

	pre {
		white-space: normal;
		border-bottom: 2px solid var(--color-light);
		padding: 10px;
	}

	.Header {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: 20px;
		margin-top: 20px;
	}

	.BookFile {
		width: fit-content;
	}

	a {
		text-decoration: none;
	}

	.Author {
		color: var(--color-main);
	}

	.Header__essentials {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.Header__image {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	i {
		color: white;
	}

	.Tags {
		display: flex;
		align-items: center;
		gap: 5px;
		flex-wrap: wrap;
	}

	.Tags i {
		color: var(--color-main);
	}

	figure img {
		width: 250px;
		height: 300px;
		object-fit: cover;
		border: 2px solid var(--color-light);
	}

	footer {
		border-top: 2px solid var(--color-light);
		width: 100%;
		margin-top: 10px;
		flex-direction: column;
		align-items: center;
		padding: 5px;
		display: flex;
		justify-content: center;
	}

	footer img {
		max-width: 200px;
		height: 100px;
		object-fit: cover;
		filter: grayscale(1);
	}

	.Rating {
		display: flex;
		flex-direction: row-reverse;
		justify-content: flex-end;
	}

	.Rating input {
		display: none;
	}

	.Rating label {
		font-size: 20px;
		color: #444;
		padding: 5px;
		float: right;
		transition: all 0.2s ease;
	}

	.Rating input:not(:checked) ~ label:hover,
	.Rating input:not(:checked) ~ label:hover ~ label {
		color: #fd4;
	}

	.Rating input:checked ~ label {
		color: #fd4;
	}
</style>
