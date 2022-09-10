<script lang="ts">
	export let url: string
	export let user_type: string
	export let token: string

	import User from '$components/User/User.svelte'
	import { onMount } from 'svelte'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import Button from '$components/HTML/Button.svelte'
	import Modal from '$components/Modal.svelte'
	import Form from '$components/HTML/Form.svelte'
	import InputFiles from '$components/HTML/InputFiles.svelte'
	import Input from '$components/HTML/Input.svelte'
	import type { UserFiles } from '$models/users/files.model'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import Table from '$components/HTML/Table.svelte'
	import { getIcon, getTypeFile } from '$utils/getIcon'
	import { formatDate } from '$utils/format'
	import downloadFileURL from '$utils/downloadFileURL'
	import Select from '$components/HTML/Select.svelte'
	// Modal
	let modalFile = false
	const toggleFile = () => (modalFile = !modalFile)
	// Form
	let file: FileList
	let fileForm = {
		title: '',
	}
	// Data
	let userFiles: UserFiles[]
	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_FILES}/api/files/get_files`,
				true,
				token,
			)
			userFiles = dataFetch.body
		} catch (err) {
			userFiles = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function validatorsFile() {
		if (file.length === 0) return { success: false, message: 'Debe seleccionar un archivo' }
		if (fileForm.title === '' || fileForm.title.length > 100)
			return { success: false, message: 'Debe existir un titulo con máx. 100 cárac.' }
		return {
			success: true,
		}
	}

	async function uploadFile() {
		try {
			const validators = validatorsFile()
			if (!validators.success) throw new Error(validators.message)
			// Generate form
			const form = new FormData()
			form.append('file', file[0])
			form.append('title', fileForm.title)
			// Send request
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API_FILES}/api/files/upload_file`,
				form,
				true,
				undefined,
				token,
			)
			userFiles = [dataFetch.body, ...userFiles]
			addToast({
				message: 'Se ha el archivo exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function downloadFile(idFile: string) {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_FILES}/api/files/get_file/${idFile}`,
				true,
				token,
			)
			downloadFileURL(dataFetch.body.token)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteFile(idFile: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API_FILES}/api/files/delete_file/${idFile}`,
				true,
				token,
			)
			userFiles = userFiles.filter((file) => {
				if (file._id.$oid !== idFile) return file
			})
			addToast({
				message: 'Se ha eliminado el archivo exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function changePermissions(e, idFile: string) {
		try {
			await API.fetchData(
				'put',
				`${variables.API_FILES}/api/files/change_permissions/${idFile}`,
				{
					permissions: e.target.value,
				},
				true,
				undefined,
				token,
			)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<User {url} {user_type}>
	<h2 slot="title">Archivos</h2>
	<section class="Content">
		<div class="Content__button">
			<Button type={'button'} click={toggleFile}>
				<i class="fa-solid fa-file-arrow-up" /> Subir archivo
			</Button>
		</div>
		<br />
		{#if userFiles}
			<Table header={['Tipo', 'Nombre', 'Permisos', 'Subida', 'Descargar', 'Eliminar']}>
				{#each userFiles as file}
					<tr>
						<td>{file.title}</td>
						<td><i class="{getIcon(file.type)} icon" /> {getTypeFile(file.type)}</td>
						<td>
							<Select
								change={(e) => changePermissions(e, file._id.$oid)}
								bind:value={file.permissions}
								id={'permissions'}
							>
								<option value="private">Privado</option>
								<option value="public">P&uacute;blico</option>
								<option value="public_classroom">P&uacute;blico Aula Virtual</option
								>
							</Select>
						</td>
						<td>{formatDate(file.date)}</td>
						<td>
							<Button type={'button'} click={() => downloadFile(file._id.$oid)}
								><i class="fa-solid fa-file-arrow-down" /></Button
							>
						</td>
						<td>
							<Button type={'button'} click={() => deleteFile(file._id.$oid)}>
								<i class="fa-solid fa-minus" />
							</Button>
						</td>
					</tr>
				{:else}
					<td>No hay archivos subidos...</td>
				{/each}
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
	</section>
</User>

<!-- Modals -->
{#if modalFile}
	<Modal onClose={toggleFile}>
		<h2 slot="title">Archivo</h2>
		<Form form={uploadFile}>
			<label for="title">Titulo</label>
			<Input bind:value={fileForm.title} id={'title'} />
			<label for="file">Archivo</label>
			<InputFiles bind:files={file} id={'file'} />
			<Button type={'submit'}>Subir archivo</Button>
		</Form>
	</Modal>
{/if}

<style>
	i {
		color: white;
	}

	.icon {
		color: var(--color-main);
	}

	.Content__button {
		max-width: 200px;
	}
</style>
