<script lang="ts">
	// Exports
	export let annoucement: Annoucement
	export let user_type: string
	export let token: string

	// Types
	import type { Annoucement } from '$models/home/annoucement.model'
	import { UserTypes } from '$models/users/user_type.model'
	// Components
	import Rich from '$components/HTML/Rich.svelte'
	import File from './File.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Modal from '$components/Modal.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	// Utils
	import { formatMiniDate } from '$utils/format'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { env } from '$env/dynamic/public'

	// Element
	let el: HTMLElement
	// Modal
	let modal = false
	const toggleModal = () => (modal = !modal)

	async function deleteAnnoucement() {
		try {
			await API.fetchDeleteData(
				`${env.PUBLIC_API}/api/annoucements/delete_annoucement/${annoucement._id}`,
				true,
				token,
			)
			addToast({
				message: 'Se ha eliminado el anuncio exitosamente',
				type: 'success',
			})
			// Delete component
			modal = false
			el.parentElement.removeChild(el)
		} catch (err) {
			addToast({
				message: err.mesage,
				type: 'error',
			})
		}
	}
</script>

<article bind:this={el} class="Annoucement">
	{#if user_type === UserTypes.DIRECTIVE || user_type === UserTypes.DIRECTOR}
		<aside>
			<ButtonIcon classItem={'fa-solid fa-xmark'} clickFunction={toggleModal} />
		</aside>
	{/if}
	<div class="Annoucement__body">
		<Rich readOnly={true} haveBackground={false} body={annoucement.annoucement} />
		<footer class="Annoucement__body--footer">
			{#each annoucement?.files as file, i}
				<File {file} {token} />
				{#if i + 1 < annoucement.files.length}
					<span>┈</span>
				{/if}
			{/each}
		</footer>
	</div>
	<footer>
		<small>
			Publicado por
			<span class="Annoucemenet__author">
				{annoucement.user.name}
				{annoucement.user.first_lastname}
			</span>
		</small>
		<small>
			{formatMiniDate(annoucement.upload_date)}
			{#if new Date(annoucement.update_date).getDate() !== new Date(annoucement.upload_date).getDate()}
				(editado)
			{/if}
		</small>
	</footer>
</article>

<!-- Modals -->
{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Eliminar anuncio</h2>
		<div class="Modal__content">
			<span>¿Est&aacute; seguro de eliminar el anuncio?</span>
		</div>
		<footer class="Modal__buttons">
			<ButtonText click={deleteAnnoucement} color={'var(--color-danger)'}
				>Eliminar anuncio</ButtonText
			>
			<ButtonText click={toggleModal}>No, no eliminar anuncio</ButtonText>
		</footer>
	</Modal>
{/if}

<style>
	aside {
		position: absolute;
		right: 10px;
		top: 10px;
		z-index: 9;
	}

	.Annoucement {
		position: relative;
		border: 2px solid var(--color-light);
		border-radius: 5px;
		padding: 10px;
	}

	.Annoucement__body {
		margin-bottom: 10px;
	}

	.Annoucement__body--footer {
		display: flex;
		margin-top: 10px;
		flex-wrap: wrap;
	}

	.Annoucement footer {
		display: flex;
		justify-content: space-between;
	}

	.Annoucemenet__author {
		color: var(--color-main);
		font-weight: bold;
	}

	.Modal__content {
		display: flex;
		width: 100%;
		justify-content: center;
	}

	.Modal__buttons {
		display: flex;
		margin-top: 10px;
	}
</style>
