<script lang="ts">
	export let books: Array<
		Book & {
			tags: Array<Tag>
			author: Author
			editorial: Editorial
		}
	>
	export let getBooks: (
		total?: boolean,
		skip?: number,
		search?: string,
		alphebet?: string,
		ranking?: string,
		added?: string,
		author?: string,
		category?: string,
		editorial?: string,
	) => Promise<any>
	export let saved: boolean
	export let token: string

	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'

	import Search from '$components/HTML/Search.svelte'
	import Select from '$components/HTML/Select.svelte'
	import { variables } from '$lib/variables'
	import type { Author } from '$models/library/author.model'
	import type { Book } from '$models/library/book.model'
	import type { Editorial } from '$models/library/editorial.model'
	import type { Tag } from '$models/library/tag.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'
	import { beforeUpdate } from 'svelte'

	let savedStatus = saved
	let search = ''
	let alphebet = 'asc'
	let ranking = ''
	let added = ''
	let author = ''
	let tag = ''
	let editorial = ''
	// Data
	let authors: Array<Author> = []
	let tags: Array<Tag> = []
	let editorials: Array<Editorial> = []

	onMount(async () => {
		try {
			const dataFetch = await Promise.allSettled([
				API.fetchGetData(`${variables.API_LIBRARY}/api/authors/get_authors`, false, token),
				API.fetchGetData(`${variables.API_LIBRARY}/api/tags/get_tags`, false, token),
				API.fetchGetData(
					`${variables.API_LIBRARY}/api/editorials/get_editorials`,
					false,
					token,
				),
			])
			if (dataFetch[0].status === 'fulfilled') authors = dataFetch[0].value.body.authors
			if (dataFetch[1].status === 'fulfilled') tags = dataFetch[1].value.body.tags
			if (dataFetch[2].status === 'fulfilled') editorials = dataFetch[2].value.body.editorials
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	beforeUpdate(() => {
		if (savedStatus !== saved) {
			searchFunction()
			savedStatus = saved
		}
	})

	async function searchFunction() {
		try {
			books = undefined
			const dataFetch = await getBooks(
				false,
				0,
				search,
				alphebet === '' ? undefined : alphebet,
				ranking === '' ? undefined : ranking,
				added === '' ? undefined : added,
				author === '' ? undefined : author,
				tag === '' ? undefined : tag,
				editorial === '' ? undefined : editorial,
			)
			books = dataFetch.body.books.books
		} catch (err) {
			books = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function alphabetFunc(type: string) {
		alphebet = type
		searchFunction()
	}

	function rankingFunc(value: string) {
		ranking = value
		searchFunction()
	}

	function addFunc(type: string) {
		added = type
		searchFunction()
	}
</script>

<nav class="Filter">
	<h4><i class="fa-solid fa-filter" /> Filtros</h4>
	<Search placeholder={'Palabra clave'} bind:value={search} search={searchFunction} />
	<div>
		<h5>Alfab&eacute;tico</h5>
		<ButtonIcon
			selected={alphebet === 'asc'}
			clickFunction={() => alphabetFunc('asc')}
			classItem={'fa-solid fa-arrow-down-a-z'}
		/>
		<ButtonIcon
			selected={alphebet === 'desc'}
			clickFunction={() => alphabetFunc('desc')}
			classItem={'fa-solid fa-arrow-up-a-z'}
		/>
	</div>
	<div class="Filter__stars">
		<h5>Clasificaci&oacute;n</h5>
		<article class="Stars">
			<input type="radio" value="5" bind:group={ranking} on:click={() => rankingFunc('5')} />
			{#each Array(5) as _}
				<i class="fa-solid fa-star" />
			{/each}
		</article>
		<article class="Stars">
			<input type="radio" value="4" bind:group={ranking} on:click={() => rankingFunc('4')} />
			{#each Array(4) as _}
				<i class="fa-solid fa-star" />
			{/each}
		</article>
		<article class="Stars">
			<input type="radio" value="3" bind:group={ranking} on:click={() => rankingFunc('3')} />
			{#each Array(3) as _}
				<i class="fa-solid fa-star" />
			{/each}
		</article>
		<article class="Stars">
			<input type="radio" value="2" bind:group={ranking} on:click={() => rankingFunc('2')} />
			{#each Array(2) as _}
				<i class="fa-solid fa-star" />
			{/each}
		</article>
		<article class="Stars">
			<input type="radio" value="1" bind:group={ranking} on:click={() => rankingFunc('1')} />
			<i class="fa-solid fa-star" />
		</article>
		<div class="Dissmiss">
			<ButtonText
				click={() => {
					ranking = ''
					searchFunction()
				}}
			>
				<i class="fa-solid fa-delete-left" /> Desmarcar
			</ButtonText>
		</div>
	</div>
	<div>
		<h5>Fecha de Añadido</h5>
		<ButtonIcon
			selected={added === 'desc'}
			clickFunction={() => addFunc('desc')}
			classItem={'fa-solid fa-arrow-down-wide-short'}
		/>
		<ButtonIcon
			selected={added === 'asc'}
			clickFunction={() => addFunc('asc')}
			classItem={'fa-solid fa-arrow-up-wide-short'}
		/>
	</div>
	<label for="author">Autor</label>
	<Select id={'author'} bind:value={author} change={searchFunction}>
		<option value="">Cualquier autor</option>
		{#each authors as author}
			<option value={author._id}>{author.name}</option>
		{/each}
	</Select>
	<label for="category">Categor&iacute;a</label>
	<Select id={'category'} bind:value={tag} change={searchFunction}>
		<option value="">Cualquier categor&iacute;a</option>
		{#each tags as tag}
			<option value={tag._id}>{tag.tag}</option>
		{/each}
	</Select>
	<label for="editorial">Editorial/publicador</label>
	<Select id={'editorial'} bind:value={editorial} change={searchFunction}>
		<option value="">Cualquier editorial/publicador</option>
		{#each editorials as editorial}
			<option value={editorial._id}>{editorial.editorial}</option>
		{/each}
	</Select>
</nav>

<style>
	.Filter {
		display: flex;
		position: sticky;
		top: 20px;
		height: fit-content;
		flex-direction: column;
		gap: 10px;
	}

	.Filter__stars {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.Stars {
		display: flex;
		width: fit-content;
		gap: 2px;
	}

	.Stars i {
		font-size: 10px;
	}

	.Dissmiss {
		width: fit-content;
	}
</style>
