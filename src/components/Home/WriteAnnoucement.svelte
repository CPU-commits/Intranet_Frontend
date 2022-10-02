<script lang="ts">
	// Exports
	export let annoucements: Array<Annoucement>
	export let token: string
	export let userName: string

	// Types
	import type { Editor } from '@tiptap/core'
	import type { UserFiles } from '$models/users/files.model'
	import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
	import type { Annoucement } from '$models/home/annoucement.model'
	import type { User } from '$models/users/users.model'
	// Imports
	import moment from 'moment-with-locales-es6'
	// Env
	import { env } from '$env/dynamic/public'
	// Components
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Rich from '$components/HTML/Rich.svelte'
	import Cloud from '$components/Cloud.svelte'
	import File from '$components/Home/File.svelte'
	// Utils
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'

	// Tiptap
	let editor: Editor
	// Cloud
	let modal = false
	let filesAttached: Array<UserFiles> = []

	async function uploadAnnoucement() {
		try {
			const annoucement = editor.getHTML()
			if (editor.getText() === '') throw new Error('Debe escribir algo a anunciar')
			const dataFetch: FetchResponse<{ _id: string }> = await API.fetchData(
				'post',
				`${env.PUBLIC_API}/api/annoucements/upload_annoucement`,
				{ annoucement, files: filesAttached.map((file) => file._id.$oid) },
				true,
				undefined,
				token,
			)
			// Push annoucement
			const user = {
				name: userName,
				first_lastname: '',
			} as User
			const now = moment().toString()
			const annoucementData = {
				_id: dataFetch.body._id,
				annoucement,
				user,
				files: filesAttached,
				update_date: now,
				upload_date: now,
			}
			annoucements = [annoucementData, ...annoucements]
			// Notify
			editor.commands.setContent('<p></p>')
			filesAttached = []
			addToast({
				message: 'Se ha publicado el anuncio exitosamente',
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

<div class="Annoucement_Write">
	<Form form={uploadAnnoucement}>
		<Rich bind:editor haveBackground={false} placeholder={'¿Algo que anunciar?'} />
		<footer class="Home__annoucements--footer">
			<ButtonIcon
				title={'Adjuntar archivos'}
				clickFunction={() => (modal = !modal)}
				classItem={'fa-solid fa-paperclip'}
			/>
		</footer>
		<Button type={'submit'}>Publicar anuncio</Button>
	</Form>
	<footer class="Annoucement_Write__attached">
		{#each filesAttached as file, i}
			<File {file} {token} />
			{#if i + 1 < filesAttached.length}
				<span>┈</span>
			{/if}
		{/each}
	</footer>
</div>

<Cloud {modal} {token} bind:filesAttached />

<style>
	.Annoucement_Write {
		border-bottom: 2px solid var(--color-light);
		padding-bottom: 10px;
	}

	.Home__annoucements--footer {
		width: 0;
		padding-left: 10px;
	}

	.Annoucement_Write__attached {
		display: flex;
		width: 100%;
		margin-top: 10px;
		padding: 5px;
		flex-wrap: wrap;
		gap: 10px;
	}
</style>
