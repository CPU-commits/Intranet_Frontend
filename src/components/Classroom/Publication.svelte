<script lang="ts">
	import { formatDate, timeAgo } from '$utils/format'

	import File from './File.svelte'
	import Link from './Link.svelte'

	import type { Publication } from '$models/classroom/publication.model'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Modal from '$components/Modal.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import TextArea from '$components/HTML/TextArea.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Button from '$components/HTML/Button.svelte'

	export let publication: Publication
	export let moduleId: string
	export let token: string
	export let canEdit = false

	let open = false
	// Modal
	let modalEdit = false
	let modalDelete = false
	const toggleModelEdit = () => (modalEdit = !modalEdit)
	const toggleModalDelete = () => (modalDelete = !modalDelete)

	let nodeRef: HTMLElement
	let editPublicationText: string

	async function deletePublication() {
		try {
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/publications/delete/${publication._id}/${moduleId}`,
				true,
				token,
			)
			addToast({
				message: 'Se ha eliminado exitosamente la publicación',
				type: 'success',
			})
			modalDelete = false
			nodeRef.parentNode.removeChild(nodeRef)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteAttached(id: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/publications/delete_attached/${id}/${moduleId}`,
				true,
				token,
			)
			publication.attached = publication.attached.filter((att) => {
				if (att._id !== id) return att
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function editPublication() {
		try {
			await API.fetchData(
				'put',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/publications/update/${publication._id}`,
				{ content: editPublicationText },
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado la publicación exitosamente',
				type: 'success',
			})
			publication.content.content = editPublicationText
			publication.update_date = new Date()
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<article bind:this={nodeRef} class="Publication">
	{#if canEdit}
		<aside>
			<ButtonIcon
				clickFunction={() => (open = !open)}
				classItem={'fa-solid fa-ellipsis-vertical'}
			/>
			<div class="Publication__config" class:Publication__config--open={open}>
				<button
					on:click={() => {
						toggleModelEdit()
						editPublicationText = publication.content.content
						open = false
					}}><i class="fa-solid fa-pen-to-square" /> Editar</button
				>
				<button
					on:click={() => {
						toggleModalDelete()
						open = false
					}}><i class="fa-solid fa-trash-can" /> Eliminar</button
				>
			</div>
		</aside>
	{/if}
	<div class="Publication__content">
		<pre>{publication.content.content}</pre>
	</div>
	{#if publication.attached && publication?.attached?.length > 0}
		<section class="Attached">
			<h4><i class="fa-solid fa-thumbtack" /> Adjuntos</h4>
			{#each publication.attached as attached}
				{#if attached.type === 'file'}
					<File
						deleteMe={() => deleteAttached(attached._id)}
						edit={true}
						{token}
						{moduleId}
						file={attached.file}
					/>
				{:else}
					<Link
						deleteMe={() => deleteAttached(attached._id)}
						edit={true}
						link={{
							link: attached.link,
							title: attached.title,
						}}
					/>
				{/if}
			{/each}
		</section>
	{/if}
	<footer class="Publication__footer">
		<div class="Publication__footer--info">
			<small>Publicado por <span>{publication.content.author}</span></small>
			{#if publication.update_date.toString() !== publication.upload_date.toString()}
				<small>(editado {formatDate(publication.update_date)})</small>
			{/if}
		</div>
		<small>{timeAgo(publication.upload_date)}</small>
	</footer>
</article>

{#if modalDelete}
	<Modal onClose={toggleModalDelete}>
		<h2 slot="title">Eliminar publicaci&oacute;n</h2>
		<span class="SpanDelete"
			>¿Est&aacute; seguro de querer eliminar esta publicaci&oacute;n?</span
		>
		<footer class="ModalDelete">
			<ButtonText color={'var(--color-danger)'} click={deletePublication}
				>S&iacute;, eliminar</ButtonText
			>
			<ButtonText color={'var(--color-dark)'} click={toggleModalDelete}
				>No, no eliminar</ButtonText
			>
		</footer>
	</Modal>
{/if}

{#if modalEdit}
	<Modal onClose={toggleModelEdit}>
		<h2 slot="title">Editar publicaci&oacute;n</h2>
		<Form form={editPublication}>
			<TextArea bind:value={editPublicationText} />
			<Button type={'submit'}>Editar</Button>
		</Form>
	</Modal>
{/if}

<style lang="scss">
	.Publication {
		border: 1px solid var(--color-light);
		padding: 15px;
		background-color: white;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
		transition: all 0.4s ease;
		position: relative;
	}

	.Publication:hover {
		box-shadow: none;
	}

	aside {
		position: absolute;
		right: 15px;
	}

	.Publication__config {
		position: absolute;
		background-color: white;
		top: 0;
		right: 10px;
		padding: 5px 10px;
		z-index: 4;
		border: 1px solid var(--color-light);
		display: none;
	}

	.Publication__config--open {
		display: block;
	}

	.Publication__config button {
		padding: 3px 0;
		width: 100%;
		display: flex;
		gap: 5px;
		transition: all 0.4s;
		font-size: 0.8rem;
		text-decoration: none;
		i {
			transition: all 0.4s;
		}
	}

	.Publication__config button:first-child:hover {
		color: var(--color-news);
		i {
			color: var(--color-news);
		}
	}

	.Publication__config button:last-child:hover {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	button {
		border: none;
		background-color: transparent;
	}

	i {
		cursor: pointer;
	}

	.Publication__content {
		display: flex;
		gap: 20px;
		padding: 15px;
		justify-content: space-between;
		align-items: center;
	}

	.Attached {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 15px;
	}

	.Publication__footer {
		margin-top: 5px;
		display: flex;
		justify-content: space-between;
	}

	.Publication__footer--info {
		display: flex;
		flex-direction: column;
	}

	small {
		padding: 3px;
		border-radius: 3px;
	}

	small span {
		color: var(--color-main);
	}

	.SpanDelete {
		text-align: center;
		color: var(--color-danger);
	}

	.ModalDelete {
		margin-top: 20px;
		display: flex;
		gap: 20px;
	}
</style>
