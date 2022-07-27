<script lang="ts">
	import Cloud from '$components/Cloud.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'

	import TextArea from '$components/HTML/TextArea.svelte'
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'
	import type { AttachedType, Publication } from '$models/classroom/publication.model'
	import type { UserFiles } from '$models/users/files.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { isValidHttpUrl } from '$utils/format'
	import Attached from './Attached.svelte'
	import File from './File.svelte'
	import Link from './Link.svelte'

	export let token: string
	export let publications: Array<Publication>
	export let idModule: string
	export let section: string
	export let user_name: string

	let text: string = ''
	type TypeObj = {
		title: string
		link: string
	}
	// Data
	let filesAttached: Array<UserFiles> = []
	let linksAttached: Array<TypeObj> = []

	function deleteFile(index: number) {
		filesAttached.splice(index, 1)
		filesAttached = filesAttached
	}

	function deleteLink(index: number) {
		linksAttached.splice(index, 1)
		linksAttached = linksAttached
	}

	async function uploadPublication() {
		try {
			if (text.length < 3) throw new Error('El texto debe tener mín. 3 cárac.')
			const attached = [
				...linksAttached.map((link) => {
					return {
						type: 'link',
						link: link.link,
						title: link.title,
					}
				}),
				...filesAttached.map((file) => {
					return {
						type: 'file',
						file: file._id.$oid,
					}
				}),
			]
			const data = {
				content: text,
				attached,
			}
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/publications/upload/${idModule}?section=${section}`,
				data,
				true,
				undefined,
				token,
			)
			publications = [
				{
					_id: dataFetch.body._id,
					attached: attached.map((att, i) => {
						const type = att.type as keyof typeof AttachedType
						if (type === 'link') {
							const attachedLink = att as TypeObj
							return {
								type,
								_id: dataFetch.body.attached_ids[i],
								link: attachedLink.link,
								title: attachedLink.title,
							}
						} else {
							return {
								type,
								_id: dataFetch.body.attached_ids[i],
								file: filesAttached[i - linksAttached.length],
							}
						}
					}),
					update_date: new Date(),
					upload_date: new Date(),
					content: {
						author: user_name,
						content: text,
					},
				},
				...publications,
			]
			addToast({
				message: 'Se ha creado la publicación exitosamente',
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

<article class="Publication">
	<div class="Publication__writting">
		<TextArea placeholder={'¿Qué hay para hoy?'} bind:value={text} />
		{#if filesAttached.length > 0 || linksAttached.length > 0}
			<section class="Attached">
				<h4><i class="fa-solid fa-thumbtack" /> Adjuntos</h4>
				{#each filesAttached as file, i}
					<File
						{token}
						moduleId={idModule}
						deleteMe={() => deleteFile(i)}
						edit={true}
						{file}
					/>
				{/each}
				{#each linksAttached as link}
					<Link deleteMe={deleteLink} edit={true} {link} />
				{/each}
			</section>
		{/if}
		<footer class="Publication__writting--footer">
			<Attached bind:filesAttached bind:linksAttached {token} />
			<div class="Publication--footer__button">
				<Button click={uploadPublication} type={'button'}>Publicar</Button>
			</div>
		</footer>
	</div>
</article>

<style>
	.Publication {
		border: 1px solid var(--color-light);
		padding: 15px;
		background-color: white;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
		transition: all 0.4s ease;
	}

	.Publication:hover {
		box-shadow: none;
	}

	.Publication__writting--footer {
		display: flex;
		gap: 20px;
		padding: 10px;
		justify-content: space-between;
		align-items: center;
	}

	.Publication--footer__button {
		max-width: 200px;
		width: 100%;
	}

	.Attached {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 15px;
	}
</style>
