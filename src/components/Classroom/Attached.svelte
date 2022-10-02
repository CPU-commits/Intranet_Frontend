<script lang="ts">
	// Exports
	export let token: string
	export let linksAttached: Array<typeof linkObj>
	export let filesAttached: Array<UserFiles>

	// Types
	import type { UserFiles } from '$models/users/files.model'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Cloud from '$components/Cloud.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Modal from '$components/Modal.svelte'
	// Utils
	import { isValidHttpUrl } from '$utils/format'

	// Modal
	let cloud: boolean = false
	let link: boolean = false
	const toggleCloud = () => (cloud = !cloud)
	const toggleLink = () => (link = !link)
	// Data
	let linkObj = {
		title: '',
		link: '',
	}

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
</script>

<div class="Attached">
	<ButtonIcon
		title={'Adjuntar archivos'}
		classItem={'fa-solid fa-paperclip'}
		clickFunction={toggleCloud}
	/>
	<ButtonIcon title={'Añadir enlace'} classItem={'fa-solid fa-link'} clickFunction={toggleLink} />
</div>

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
	.Attached {
		display: flex;
		align-items: flex-start;
		gap: 10px;
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
