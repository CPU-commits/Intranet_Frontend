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
					token: session.user.token,
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
	import Panel from '$components/Admin/Panel.svelte'
	import TableSmall from '$components/HTML/TableSmall.svelte'
	import type { Author } from '$models/library/author.model'
	import { urlify } from '$utils/format'
	import Input from '$components/HTML/Input.svelte'
	import TextArea from '$components/HTML/TextArea.svelte'
	import Form from '$components/HTML/Form.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import { addToast } from '$stores/toasts'
	import { serialize } from 'object-to-formdata'
	import { validateAuthor } from '$utils/validators'
	import { goto } from '$app/navigation'
	import Button from '$components/HTML/Button.svelte'
	import Modal from '$components/Modal.svelte'

	export let token: string
	export let author: Author
	// Modals
	let modalInfo = false
	const toggleInfo = () => {
		modalInfo = !modalInfo
		itemInfo = {
			key: '',
			value: '',
		}
	}
	// Form
	let fileInput: HTMLInputElement
	let src = author.image.url
	let itemInfo = {
		key: '',
		value: '',
	}

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

	function addElement() {
		author.table_info = [
			...author.table_info,
			{
				key: itemInfo.key,
				value: itemInfo.value,
			},
		]
		toggleInfo()
	}

	function removeElement(index: number) {
		author.table_info.splice(index)
		author.table_info = author.table_info
	}

	function addFunFact() {
		author.fun_facts = [
			...author.fun_facts,
			{
				title: '',
				fact: '',
			},
		]
	}

	function removeFact(index: number) {
		author.fun_facts.splice(index)
		author.fun_facts = author.fun_facts
	}

	function addReference() {
		author.references = [...author.references, '']
	}

	function removeReference(index: number) {
		author.references.splice(index)
		author.references = author.references
	}

	function buildData() {
		let form = new FormData()
		form.append('name', author.name)
		form.append('biography', author.biography)
		form = serialize(author.table_info, { indices: true }, form, 'table_info')
		form = serialize(author.fun_facts, { indices: true }, form, 'fun_facts')
		if (author.references.length > 0)
			form = serialize(author.references, { indices: true }, form, 'references')
		if (fileInput.files.length > 0) form.append('image', fileInput.files[0])
		return form
	}

	async function updateAuthor() {
		try {
			validateAuthor(author)
			await API.fetchData(
				'put',
				`${variables.API_LIBRARY}/api/authors/update_author/${author._id}`,
				buildData(),
				true,
				undefined,
				token,
			)
			goto('/admin/biblioteca/autores')
			addToast({
				message: 'Se ha editado el autor exitosamente',
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
	<h2>Nuevo autor</h2>
	<Form form={updateAuthor}>
		<section class="Header">
			<article class="Header__essentials">
				<label for="name">Nombre</label>
				<Input bind:value={author.name} id={'name'} />
				<label for="biography">Biograf&iacute;a</label>
				<TextArea bind:value={author.biography} />
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
				<small>Tabla de informaci&oacute;n</small>
				<TableSmall>
					{#each author.table_info as item, i}
						<tr>
							<td>{item.key}</td>
							<td>{item.value}</td>
							<td>
								<ButtonIcon
									title={'Eliminar elemento'}
									classItem={'fa-solid fa-minus'}
									clickFunction={() => removeElement(i)}
								/>
							</td>
						</tr>
					{:else}
						<tr>
							<td>Sin elementos...</td>
						</tr>
					{/each}
				</TableSmall>
				<ButtonIcon
					title={'Añadir elemento'}
					clickFunction={toggleInfo}
					classItem={'fa-solid fa-plus'}
				/>
			</figure>
		</section>
		<h3>Datos curiosos</h3>
		<section class="Fun_facts">
			{#each author.fun_facts as fun_fact, i}
				<details>
					<summary>
						<label for="title">Titulo</label>
						<ButtonIcon
							title={'Eliminar dato curioso'}
							classItem={'fa-solid fa-minus'}
							clickFunction={() => removeFact(i)}
						/>
						<Input id={'title'} bind:value={fun_fact.title} />
					</summary>
					<label for="fact">Dato curioso</label>
					<TextArea bind:value={fun_fact.fact} />
				</details>
			{:else}
				<span>Sin datos curiosos...</span>
			{/each}
		</section>
		<ButtonIcon
			title={'Añadir referencia'}
			clickFunction={addFunFact}
			classItem={'fa-solid fa-circle-plus'}
		/>
		<h3><i class="fa-solid fa-book-atlas" /> Referencias (Preferentemente APA) *</h3>
		{#each author.references as reference, i}
			<article class="Reference">
				<Input bind:value={reference} placeholder={'Referencia'} />
				<ButtonIcon
					title={'Eliminar referencia'}
					classItem={'fa-solid fa-minus'}
					clickFunction={() => removeReference(i)}
				/>
			</article>
		{/each}
		<ButtonIcon
			title={'Añadir referencia'}
			clickFunction={addReference}
			classItem={'fa-solid fa-circle-plus'}
		/>
		<small>(*) Opcional</small>
		<Button type={'submit'}>Actualizar autor</Button>
	</Form>
</Panel>

{#if modalInfo}
	<Modal onClose={toggleInfo}>
		<h2 slot="title">Añadir elemento a tabla de informaci&oacute;n</h2>
		<Form form={addElement}>
			<label for="title">Titulo</label>
			<Input id={'title'} bind:value={itemInfo.key} />
			<label for="value">Valor</label>
			<Input id={'title'} bind:value={itemInfo.value} />
			<Button type={'submit'}>Añadir elemento</Button>
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

	.Fun_facts {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.Reference {
		display: flex;
		gap: 10px;
	}
</style>
