<script context="module">
	export function load({ session }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
			},
		}
	}
</script>

<script lang="ts">
	import { serialize } from 'object-to-formdata'

	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	import { variables } from '$lib/variables'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { goto } from '$app/navigation'
	import type { Book } from '$models/library/book.model'
	import { onMount } from 'svelte'
	import type { Tag } from '$models/library/tag.model'
	import type { Author } from '$models/library/author.model'
	import type { Editorial } from '$models/library/editorial.model'
	import Select from '$components/HTML/Select.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Modal from '$components/Modal.svelte'
	import InputFiles from '$components/HTML/InputFiles.svelte'
	import { validateBook } from '$utils/validators'

	export let token: string
	// Modal
	let modal = false
	const toggleModal = () => (modal = !modal)
	// Form
	let fileInput: HTMLInputElement
	let files: FileList
	let src = '/img/image.svg'
	let book = {
		name: '',
		synopsis: '',
		tags: [],
		author: '',
		editorial: '',
	} as Book & { tags: Array<string> }
	let tag = ''
	// Data
	let tags: Array<Tag>
	let authors: Array<Author>
	let editorials: Array<Editorial>

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(`${variables.API_LIBRARY}/api/tags/get_tags`, false, token),
				API.fetchGetData(`${variables.API_LIBRARY}/api/authors/get_authors`, false, token),
				API.fetchGetData(
					`${variables.API_LIBRARY}/api/editorials/get_editorials`,
					false,
					token,
				),
			])
			tags = dataFetch[0].body.tags
			authors = dataFetch[1].body.authors
			editorials = dataFetch[2].body.editorials
		} catch (err) {
			tags = []
			authors = []
			editorials = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function onFileSelected(e) {
		let image = e.target.files[0]
		if (!image?.type?.includes('image')) {
			addToast({
				message: 'Debe seleccionar una imagen',
				type: 'error',
			})
			return
		}
		const reader = new FileReader()
		reader.readAsDataURL(image)
		reader.onload = (e) => {
			src = e.target.result.toString()
		}
	}

	function getTag(_id: string | Tag) {
		const findIndex = tags.findIndex((t) => t._id === _id)
		return tags[findIndex].tag
	}

	function addTag() {
		if (!book.tags.some((t) => t === tag)) book.tags = [...book.tags, tag]
	}

	function removeTag(index: number) {
		book.tags.splice(index, 1)
		book.tags = book.tags
	}

	function buildData() {
		let form = new FormData()
		form.append('name', book.name)
		form.append('synopsis', book.synopsis)
		form = serialize(book.tags, { indices: true }, form, 'tags')
		form.append('author', book.author.toString())
		form.append('editorial', book.editorial.toString())
		form.append('image', fileInput.files[0])
		form.append('book', files[0])
		return form
	}

	async function uploadAuthor() {
		try {
			if (fileInput.files.length === 0)
				throw new Error('Debe seleccionar una imagen para el libro')
			if (files.length === 0) throw new Error('Debe seleccionar un PDF Con el libro')
			validateBook(book)
			await API.fetchData(
				'post',
				`${variables.API_LIBRARY}/api/books/upload_book`,
				buildData(),
				true,
				undefined,
				token,
			)
			goto('/admin/biblioteca')
			addToast({
				message: 'Se ha subido el libro exitosamente',
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

<Panel nav={false}>
	{#if editorials}
		<h2>Nuevo Libro</h2>
		<Form form={uploadAuthor}>
			<section class="Header">
				<article class="Header__essentials">
					<label for="name">Nombre</label>
					<Input bind:value={book.name} id={'name'} />
					<label for="biography">Sinopsis</label>
					<TextArea bind:value={book.synopsis} />
				</article>
				<figure class="Header__image">
					<img
						on:click={() => fileInput.click()}
						title="Subir imagen"
						{src}
						alt="Subir imagen"
					/>
					<input
						on:change={(e) => onFileSelected(e)}
						bind:this={fileInput}
						style="display:none"
						accept=".jpg, .jpeg, .png"
						type="file"
					/>
				</figure>
			</section>
			<label for="book">Archivo | Libro</label>
			<InputFiles
				accept={'application/pdf'}
				filter={{
					filter: true,
					type: 'pdf',
					message: 'Se requiere un archivo PDF',
				}}
				bind:files
				id={'book'}
			/>
			<label for="author">Autor</label>
			<Select id={'author'} bind:value={book.author}>
				<option value="">Seleccione un autor</option>
				{#each authors as author}
					<option value={author._id}>{author.name}</option>
				{/each}
			</Select>
			<label for="editorial">Editorial</label>
			<Select id={'editorial'} bind:value={book.editorial}>
				<option value="">Seleccione un autor</option>
				{#each editorials as editorial}
					<option value={editorial._id}>{editorial.editorial}</option>
				{/each}
			</Select>
			<h3><i class="fa-solid fa-tags" /> Categorias</h3>
			<ul>
				{#each book.tags as tag, i}
					<li>
						{getTag(tag)}
						<ButtonIcon
							clickFunction={() => removeTag(i)}
							classItem={'fa-solid fa-minus'}
						/>
					</li>
				{:else}
					<li>Sin categorias</li>
				{/each}
			</ul>
			<ButtonIcon
				title={'Añadir categoria'}
				classItem={'fa-solid fa-plus'}
				clickFunction={toggleModal}
			/>
			<Button type={'submit'}>Subir libro</Button>
		</Form>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Añadir categoria</h2>
		<Form form={addTag}>
			<label for="">Categoria</label>
			<Select bind:value={tag} id={'tag'}>
				<option value="">Seleccione una categoria</option>
				{#each tags as tag}
					<option value={tag._id}>{tag.tag}</option>
				{/each}
			</Select>
			<Button type={'submit'}>Añadir categoria</Button>
		</Form>
	</Modal>
{/if}

<style>
	.Header {
		display: grid;
		grid-template-columns: 1fr 200px;
		gap: 20px;
		margin-top: 20px;
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
	}

	img {
		width: 200px;
		height: 200px;
		object-fit: cover;
		border: 2px solid var(--color-light);
	}

	ul {
		padding: 0 15px;
	}
</style>
