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
	import File from './File.svelte'
	import Link from './Link.svelte'

	export let token: string
	export let publications: Array<Publication>
	export let idModule: string
	export let section: string
	export let user_name: string

	let text: string = ''
	let linkObj = {
		title: '',
		link: '',
	}
	// Modal
	let cloud: boolean = false
	let link: boolean = false
	const toggleCloud = () => (cloud = !cloud)
	const toggleLink = () => (link = !link)
	// Data
	let filesAttached: Array<UserFiles> = []
	let linksAttached: Array<typeof linkObj> = []

	function addLink() {
		try {
			if (linkObj.title.length < 3 || linkObj.title.length > 100)
				throw new Error('El titulo debe tener mín. 3 y máx 100 cárac.')
			if (!isValidHttpUrl(linkObj.link)) throw new Error('Debe ingresar un enlace válido')
			linksAttached = [
				...linksAttached,
				{
					title: linkObj.title,
					link: linkObj.link,
				},
			]
			linkObj = {
				title: '',
				link: '',
			}
			link = false
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

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
							const attachedLink = att as typeof linkObj
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
			console.log(publications)
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
			<div>
				<ButtonIcon
					title={'Adjuntar archivos'}
					classItem={'fa-solid fa-paperclip'}
					clickFunction={toggleCloud}
				/>
				<ButtonIcon
					title={'Añadir enlace'}
					classItem={'fa-solid fa-link'}
					clickFunction={toggleLink}
				/>
			</div>
			<div class="Publication--footer__button">
				<Button click={uploadPublication} type={'button'}>Publicar</Button>
			</div>
		</footer>
	</div>
</article>

{#if cloud}
	<Cloud bind:filesAttached {token} bind:modal={cloud} />
{/if}

{#if link}
	<Modal onClose={toggleLink}>
		<h2 slot="title">Agregar enlace</h2>
		<Form form={addLink}>
			<label for="title">Titulo</label>
			<Input bind:value={linkObj.title} id={'title'} />
			<label for="link">Enlace</label>
			<Input bind:value={linkObj.link} type={'url'} id={'link'} />
			{#if linkObj.link.startsWith('http:')}
				<small><i class="fa-solid fa-bomb" /> No es un enlace seguro</small>
			{/if}
			<Button type={'submit'}>Agregar enlace</Button>
		</Form>
	</Modal>
{/if}

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

	small,
	small i {
		color: white;
		padding: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-danger);
		border-radius: 3px;
	}
</style>
