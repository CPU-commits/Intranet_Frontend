<script context="module">
	export function load({ session }) {
		return {
			status: 200,
			props: {
				user_type: session.user.user_type,
				token: session.user.token,
			},
		}
	}
</script>

<script lang="ts">
	import Icons from '$components/Admin/Icons.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import AIcon from '$components/HTML/AIcon.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import InputFiles from '$components/HTML/InputFiles.svelte'
	import Table from '$components/HTML/Table.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import Search from '$components/HTML/Search.svelte'
	import { variables } from '$lib/variables'
	import type { Author } from '$models/library/author.model'
	import type { Book } from '$models/library/book.model'
	import type { Editorial } from '$models/library/editorial.model'
	import type { Tag } from '$models/library/tag.model'
	import type { User } from '$models/users/users.model'
	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { formatDate } from '$utils/format'
	import onscrollLoading from '$utils/onscrollLoading'
	import validator from '$utils/validateRut'
	import { onMount } from 'svelte'

	export let user_type: string
	export let token: string

	const LIMIT = 20
	let runningLoading = false
	let search = ''
	// Data
	let librarians: Array<User>
	let tags: Array<Tag>
	let editorials: Array<Editorial>
	let books: Array<Book>
	// Form
	let librarianForm = {
		name: '',
		first_lastname: '',
		second_lastname: '',
		rut: '',
	}
	let why: string = ''
	let librarianEdit: User
	let librarianIndex: number

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(`${variables.API}/api/library/get_librarians`, false, token),
				API.fetchGetData(`${variables.API_LIBRARY}/api/tags/get_tags`, false, token),
				API.fetchGetData(
					`${variables.API_LIBRARY}/api/editorials/get_editorials`,
					false,
					token,
				),
				getBooks(true, 0),
			])
			librarians = dataFetch[0].body.librarians.users
			tags = dataFetch[1].body.tags
			editorials = dataFetch[2].body.editorials
			books = dataFetch[3].body.books.books
			// Onscroll
			onscrollLoading(
				dataFetch[3].body.books.total,
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
			tags = []
			books = []
			librarians = []
			editorials = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function getBooks(total = false, skip?: number, search?: string) {
		let URL = `${variables.API_LIBRARY}/api/books/get_books?total=${total}&limit=${LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip >= 0) URL += `&skip=${skip}`
		const data = await API.fetchGetData(URL, false, token)
		return data
	}

	async function searchFunction() {
		try {
			books = undefined
			const dataFetch = await getBooks(false, 0, search)
			books = dataFetch.body.books.books
		} catch (err) {
			books = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	// Modals
	let modalLibrarian = false
	let modalAddLibrarian = false
	let modalEditLibrarian = false
	let modalStatus = false
	let modalTags = false
	let modalEditorials = false
	let modalEditEditorial = false
	const toggleLibrarian = () => (modalLibrarian = !modalLibrarian)
	const toggleAddLibrarian = () => {
		toggleLibrarian()
		modalAddLibrarian = !modalAddLibrarian
	}
	const toggleEditLibrarian = () => {
		toggleLibrarian()
		modalEditLibrarian = !modalEditLibrarian
	}
	const toggleModalStatus = () => {
		modalEditLibrarian = !modalEditLibrarian
		why = ''
		modalStatus = !modalStatus
	}
	const toggleTags = () => (modalTags = !modalTags)
	const toggleEditorials = () => (modalEditorials = !modalEditorials)
	const toggleEditEditorial = () => {
		toggleEditorials()
		editorial = ''
		files = null
		modalEditEditorial = !modalEditEditorial
	}

	// Librarian
	function validatorsLibrarian(formDirective: User) {
		if (formDirective.name === '' || formDirective.name.length > 100)
			throw new Error('Debe existir un nombre de máx. 100 carac.')
		if (formDirective.first_lastname === '' || formDirective.first_lastname.length > 100)
			throw new Error('Debe existir un apellido paterno de máx. 100 carac.')
		if (formDirective.second_lastname === '' || formDirective.second_lastname.length > 100)
			throw new Error('Debe existir un apellido materno de máx. 100 carac.')
		if (formDirective.rut.length < 10 || !validator.rutValidator(formDirective.rut))
			throw new Error('Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)')
	}

	function initForm(newLibrarian: User) {
		toggleAddLibrarian()
		librarianForm = {
			name: '',
			first_lastname: '',
			second_lastname: '',
			rut: '',
		}
		librarians = [newLibrarian, ...librarians]
	}

	async function uploadLibrarian() {
		try {
			validatorsLibrarian(librarianForm)
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/library/new_librarian`,
				librarianForm,
				true,
				undefined,
				token,
			)
			initForm(dataFetch.body.librarian)
			addToast({
				message: 'Se ha agregado el bibliotecario exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function editLibrarian() {
		try {
			validatorsLibrarian(librarianEdit)
			const index = librarianIndex
			await API.fetchData(
				'put',
				`${variables.API}/api/library/edit_librarian/${librarianEdit._id}`,
				librarianEdit,
				true,
				undefined,
				token,
			)
			toggleEditLibrarian()
			librarians[index] = librarianEdit
			addToast({
				message: 'Se ha editado con éxito el bibliotecario',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function initStatusForm() {
		why = ''
		toggleModalStatus()
	}

	async function changeStatus() {
		try {
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')
			const index = librarianIndex
			await API.fetchData(
				'post',
				`${variables.API}/api/directive/change_status/${librarianEdit._id}`,
				{ why },
				true,
				undefined,
				token,
			)
			initStatusForm()
			librarians[index].status = librarians[index].status === 1 ? 0 : 1
			addToast({
				message: 'Se ha cambiado el estado del bibliotecario exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Tags
	let tag = ''

	async function uploadCategory() {
		try {
			if (tag === '' || tag.length > 100)
				throw new Error('Debe existir una categoria de máx. 100 cárac.')
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API_LIBRARY}/api/tags/new_tag`,
				{ tag },
				true,
				undefined,
				token,
			)
			tag = ''
			tags = [dataFetch.body.tag, ...tags]
			addToast({
				message: 'Se ha subido la categoria exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteTag(idTag: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API_LIBRARY}/api/tags/delete_tag/${idTag}`,
				true,
				token,
			)
			tags = tags.filter((tag) => {
				if (tag._id !== idTag) return tag
			})
			addToast({
				message: 'Se ha eliminado la categoria exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Editorial
	let editorial = ''
	let files: FileList
	let idEditorial: string

	async function uploadEditorial() {
		try {
			if (editorial === '' || editorial.length > 100)
				throw new Error('Debe existir una editorial de máx. 100 cárac.')
			if (files.length === 0) throw new Error('Debe seleccionar una imágen')
			const form = new FormData()
			form.append('editorial', editorial)
			form.append('image', files[0])
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API_LIBRARY}/api/editorials/upload_editorial`,
				form,
				true,
				undefined,
				token,
			)
			editorials = [dataFetch.body.editorial, ...editorials]
			addToast({
				message: 'Se ha agregado la editorial exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function updateEditorial() {
		try {
			if (editorial.length > 100) throw new Error('La editorial debe tener máx. 100 cárac.')
			const form = new FormData()
			form.append('editorial', editorial)
			if (files?.length > 0) form.append('image', files[0])
			const dataFetch = await API.fetchData(
				'put',
				`${variables.API_LIBRARY}/api/editorials/update_editorial/${idEditorial}`,
				form,
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado la editorial exitosamente',
				type: 'success',
			})
			// Update
			const index = editorials.findIndex((e) => e._id === idEditorial)
			editorials[index].editorial = editorial
			if (files?.length > 0) editorials[index].image.url = dataFetch.body.image
			toggleEditEditorial()
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteEditorial(idEditorial: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API_LIBRARY}/api/editorials/delete_editorial/${idEditorial}`,
				true,
				token,
			)
			addToast({
				message: 'Se ha eliminado la editorial exitosamente',
				type: 'success',
			})
			editorials = editorials.filter((editorial) => {
				if (editorial._id !== idEditorial) return editorial
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteBook(_id: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API_LIBRARY}/api/books/delete_book/${_id}`,
				true,
				token,
			)
			addToast({
				message: 'Se ha eliminado el libro exitosamente',
				type: 'success',
			})
			books = books.filter((book) => {
				if (book._id !== _id) return book
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
	// Reflect type
	const returnAuthor = (author: string | Author): Author => author as Author
	const returnEd = (editorial: string | Editorial): Editorial => editorial as Editorial
</script>

<Panel>
	<Icons slot="nav">
		<AIcon
			title={'Añadir libro'}
			classItem={'fa-solid fa-plus'}
			href={'/admin/biblioteca/nuevo_libro'}
		/>
		<AIcon
			title={'Autores'}
			classItem={'fa-solid fa-pen-nib'}
			href={'/admin/biblioteca/autores'}
		/>
		<ButtonIcon
			title={'Editoriales/publicadores'}
			classItem={'fa-solid fa-bullhorn'}
			clickFunction={toggleEditorials}
		/>
		<ButtonIcon
			title={'Categorias'}
			classItem={'fa-solid fa-tags'}
			clickFunction={toggleTags}
		/>
		{#if user_type !== UserTypes.LIBRARIAN}
			<ButtonIcon
				title={'Bibliotecarios'}
				clickFunction={toggleLibrarian}
				classItem={'fa-solid fa-user-graduate'}
			/>
		{/if}
	</Icons>
	<h2>Biblioteca - Libros</h2>
	<Search bind:value={search} search={searchFunction} />
	{#if books}
		<br />
		<Table header={['', 'Nombre', 'Autor', 'Editorial', 'Ranking', 'Editar']}>
			{#each books as book}
				<tr>
					<td><img src={book.image.url} alt={book.name} /></td>
					<td>
						<a class="Link" href="/biblioteca/libro/{book.slug}">{book.name}</a>
					</td>
					<td>{returnAuthor(book.author).name}</td>
					<td>{returnEd(book.editorial).editorial}</td>
					<td>{book.ranking ? book.ranking : 'Sin raking'}</td>
					<td>
						<AIcon
							classItem={'fa-solid fa-pen-to-square'}
							href={`/admin/biblioteca/editar/${book.slug}`}
						/>
					</td>
					<td>
						<ButtonIcon
							title={'Eliminar libro'}
							classItem={'fa-solid fa-circle-minus'}
							clickFunction={() => deleteBook(book._id)}
						/>
					</td>
				</tr>
			{:else}
				<tr>
					<td>Sin libros...</td>
				</tr>
			{/each}
		</Table>
		{#if runningLoading}
			<SpinnerGet />
		{/if}
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

{#if modalLibrarian}
	<Modal onClose={toggleLibrarian}>
		<h2 slot="title">Bibliotecarios</h2>
		{#if librarians}
			<Table header={['Nombre', 'Ap. P.', 'Ap. M.', 'RUT', 'Estado', '']}>
				{#each librarians as librarian, i}
					<tr>
						<td>{librarian.name}</td>
						<td>{librarian.first_lastname}</td>
						<td>{librarian.second_lastname}</td>
						<td>{librarian.rut}</td>
						<td>{librarian.status ? 'Activo' : 'Inactivo'}</td>
						<td>
							<Button
								click={() => {
									toggleEditLibrarian()
									librarianEdit = librarian
									librarianIndex = i
								}}
								type={'button'}><i class="fa-solid fa-pen-to-square" /></Button
							>
						</td>
					</tr>
				{:else}
					<tr>
						<td>Sin bibliotecarios...</td>
					</tr>
				{/each}
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
		<br />
		<Button click={toggleAddLibrarian} type={'button'}>Nuevo bibliotecario</Button>
	</Modal>
{/if}

{#if modalAddLibrarian}
	<Modal onClose={toggleAddLibrarian}>
		<h2 slot="title">Nuevo bibliotecario</h2>
		<Form form={uploadLibrarian}>
			<label for="name">Nombre</label>
			<Input bind:value={librarianForm.name} id="name" />
			<label for="fln">Apellido Paterno</label>
			<Input bind:value={librarianForm.first_lastname} id="fln" />
			<label for="sln">Apellido Materno</label>
			<Input bind:value={librarianForm.second_lastname} id="sln" />
			<label for="rut">RUT</label>
			<Input bind:value={librarianForm.rut} id="rut" />
			<Button type={'submit'}>Agregar bibliotecario</Button>
		</Form>
	</Modal>
{/if}

{#if modalEditLibrarian}
	<Modal onClose={toggleEditLibrarian}>
		<h2 slot="title">
			Editar bibliotecario
			{librarians[librarianIndex].name}
			{librarians[librarianIndex].first_lastname}
		</h2>
		<Form form={editLibrarian}>
			<label for="nameE">Nombre</label>
			<Input bind:value={librarianEdit.name} id="nameE" />
			<label for="flnE">Apellido Paterno</label>
			<Input bind:value={librarianEdit.first_lastname} id="flnE" />
			<label for="slnE">Apellido Materno</label>
			<Input bind:value={librarianEdit.second_lastname} id="slnE" />
			<label for="rutE">RUT</label>
			<Input bind:value={librarianEdit.rut} id="rutE" />
			<Button type={'submit'}>Editar bibliotecario</Button>
		</Form>
		{#if librarianEdit.status === 1}
			<button on:click={toggleModalStatus} class="Form__button Down" type="button"
				><i class="fa-solid fa-angles-down" /> Dar de baja bibliotecario
			</button>
		{:else}
			<button on:click={toggleModalStatus} class="Form__button Up" type="button">
				<i class="fa-solid fa-angles-up" /> Reintegrar bibliotecario
			</button>
		{/if}
	</Modal>
{/if}

{#if modalStatus}
	<Modal onClose={toggleModalStatus}>
		<h2 slot="title">
			Cambiar estado bibliotecario - {librarianEdit.status === 1
				? 'Dar de baja'
				: 'Reintegrar'}
		</h2>
		<Form form={changeStatus}>
			<label for="why">Motivo</label>
			<TextArea bind:value={why} />
			<Button type={'submit'}>Cambiar estado</Button>
		</Form>
	</Modal>
{/if}

{#if modalTags}
	<Modal onClose={toggleTags}>
		<h2 slot="title">Categorias</h2>
		{#if tags}
			<Form form={uploadCategory}>
				<label for="tag">Categoria</label>
				<Input id={'tag'} bind:value={tag} />
				<Button type={'submit'}>Subir categoria</Button>
			</Form>
			<br />
			<Table header={['Categoria', 'Fecha', '']}>
				{#each tags as tag}
					<tr>
						<td>{tag.tag}</td>
						<td>{formatDate(tag.date)}</td>
						<td>
							<ButtonIcon
								clickFunction={() => deleteTag(tag._id)}
								classItem={'fa-solid fa-circle-minus'}
							/>
						</td>
					</tr>
				{:else}
					<tr>
						<td>Sin categorias...</td>
					</tr>
				{/each}
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
	</Modal>
{/if}

{#if modalEditorials}
	<Modal onClose={toggleEditorials}>
		<h2 slot="title">Editoriales</h2>
		{#if editorials}
			<Form form={uploadEditorial}>
				<label for="editorial">Editorial</label>
				<Input id={'editorial'} bind:value={editorial} />
				<label for="image">Imagen</label>
				<InputFiles id={'image'} bind:files />
				<Button type={'submit'}>Subir editorial</Button>
			</Form>
			<br />
			<Table header={['', 'Editorial', 'Fecha', '']}>
				{#each editorials as _editorial}
					<tr>
						<td>
							<img src={_editorial.image.url} alt="Editorial" />
						</td>
						<td>{_editorial.editorial}</td>
						<td>{formatDate(_editorial.date)}</td>
						<td>
							<ButtonIcon
								clickFunction={() => {
									toggleEditEditorial()
									idEditorial = _editorial._id
									editorial = _editorial.editorial
								}}
								classItem={'fa-solid fa-pen-to-square'}
							/>
						</td>
						<td>
							<ButtonIcon
								clickFunction={() => deleteEditorial(_editorial._id)}
								classItem={'fa-solid fa-circle-minus'}
							/>
						</td>
					</tr>
				{:else}
					<tr>
						<td>Sin editoriales...</td>
					</tr>
				{/each}
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
	</Modal>
{/if}

{#if modalEditEditorial}
	<Modal onClose={toggleEditEditorial}>
		<h2 slot="title">Editar editorial</h2>
		<Form form={updateEditorial}>
			<label for="editorial">Editorial</label>
			<Input bind:value={editorial} id={'editorial'} />
			<label for="image">Imagen</label>
			<InputFiles id={'image'} bind:files />
			<Button type={'submit'}>Subir editorial</Button>
		</Form>
	</Modal>
{/if}

<style lang="scss">
	i {
		color: white;
	}

	.Form__button {
		position: absolute;
		top: 75px;
		background: transparent;
		border: none;
	}

	.Down {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	.Up {
		color: var(--color-main);
		i {
			color: var(--color-main);
		}
	}

	img {
		width: 150px;
		height: 100px;
		object-fit: cover;
	}
</style>
