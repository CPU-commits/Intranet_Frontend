<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Author } from '$models/library/author.model'
	import type { Book } from '$models/library/book.model'
	import type { Editorial } from '$models/library/editorial.model'
	import type { Tag } from '$models/library/tag.model'
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Button from '$components/HTML/Button.svelte'
	import BookComponent from '$components/Library/Book.svelte'
	import LMenu from '$components/Library/LMenu.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import onscrollLoading from '$utils/onscrollLoading'

	let token = data.user.token
	const LIMIT = 20
	let saved = false
	let runningLoading = false
	let books: Array<
		Book & {
			tags: Array<Tag>
			author: Author
			editorial: Editorial
		}
	>

	onMount(async () => {
		try {
			const dataFetch = await getBooks(true, 0)
			books = dataFetch.body.books.books
			// Onscroll
			onscrollLoading(
				dataFetch.body.books.total,
				async (n: number) => {
					runningLoading = true
					try {
						const dataFetch = await getBooks(false, n)
						books = [...books, ...dataFetch.body.books.books]
						runningLoading = false
						return n + LIMIT
					} catch (err) {
						runningLoading = false
						books = []
						addToast({
							message: err.message,
							type: 'error',
						})
						return n
					}
				},
				LIMIT,
			)
		} catch (err) {
			books = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getBooks(
		total = false,
		skip?: number,
		search?: string,
		alphebet?: string,
		ranking?: string,
		added?: string,
		author?: string,
		category?: string,
		editorial?: string,
	) {
		let URL = `${variables.API_LIBRARY}/api/books/get_books?total=${total}&limit=${LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip >= 0) URL += `&skip=${skip}`
		if (alphebet) URL += `&alphabet=${alphebet}`
		if (ranking) URL += `&ranking=${ranking}`
		if (added) URL += `&added=${added}`
		if (author) URL += `&author=${author}`
		if (category) URL += `&category=${category}`
		if (editorial) URL += `&editorial=${editorial}`
		if (saved) URL += `&saved=true`
		const data = await API.fetchGetData(URL, false, token)
		return data
	}
</script>

<section class="Library">
	<LMenu {saved} {token} bind:books {getBooks} />
	<section class="Books">
		<aside>
			<Button type={'button'} click={() => (saved = !saved)}>
				<i class="fa-solid fa-bookmark" /> Guardados
				{#if saved}
					<i class="fa-solid fa-circle-xmark" />
				{/if}
			</Button>
		</aside>
		{#if books}
			{#each books as book}
				<BookComponent {token} {book} />
			{:else}
				<section class="Void">
					<img src="/img/fishing.svg" alt="Pescando" />
					<span>No se ha pescado ning&uacute;n libro</span>
				</section>
			{/each}
		{:else}
			<SpinnerGet />
		{/if}
	</section>
	{#if runningLoading}
		<SpinnerGet />
	{/if}
</section>

<style>
	.Library {
		display: grid;
		grid-template-columns: 1fr 3.5fr;
		margin: 20px;
		height: 100%;
		gap: 20px;
		position: relative;
	}

	.Books {
		padding: 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		justify-content: center;
		align-items: center;
		border-radius: 15px;
		position: relative;
		margin-top: 20px;
	}

	aside {
		position: absolute;
		left: 0;
		top: -20px;
	}

	i {
		color: white;
	}

	.Void {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.Void img {
		max-height: 300px;
	}
</style>
