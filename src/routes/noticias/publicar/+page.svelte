<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Editor } from '@tiptap/core'
	import type { Session } from '$models/session.model'
	// Svelte
	import { goto } from '$app/navigation'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Form from '$components/HTML/Form.svelte'
	import Rich from '$components/HTML/Rich.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	// Init variables
	let token = data.user.token
	// Form
	let news = {
		title: '',
		headline: '',
		body: '',
	}
	let src = '/img/news.svg'
	let fileInput: HTMLInputElement
	let editor: Editor

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

	function validatorsNews() {
		if (news.title.length < 3 || news.title.length > 100)
			return { success: false, message: 'Debe existir un titulo de mín 3 cárac. y máx 100' }
		if (news.headline.length < 3 || news.headline.length > 500)
			return { success: false, message: 'Debe existir una bajada de mín 3 cárac. y máx 500' }
		if (fileInput.files.length === 0)
			return { success: false, message: 'Debe seleccionar una imagen' }
		if (news.body.length < 10)
			return { success: false, message: 'Debe existir un cuerpo de mín 10 cárac.' }
		return { success: true }
	}

	function buildForm() {
		const form = new FormData()
		form.append('title', news.title)
		form.append('headline', news.headline)
		form.append('body', news.body)
		form.append('img', fileInput.files[0])
		return form
	}

	async function publishNews() {
		try {
			news.body = editor.getHTML()
			const validators = validatorsNews()
			if (!validators.success) throw new Error(validators.message)
			await API.fetchData(
				'post',
				`${variables.API_NEWS}/api/news/new_news`,
				buildForm(),
				true,
				undefined,
				token,
			)
			goto('/noticias')
			addToast({
				type: 'success',
				message: 'Se ha subido la noticia exitosamente',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="News">
	<div class="News__contain">
		<Form form={publishNews}>
			<input bind:value={news.title} placeholder="Titulo" type="text" />
			<textarea bind:value={news.headline} placeholder="Bajada" />
			<img on:click={() => fileInput.click()} title="Subir imagen" {src} alt="Subir imagen" />
			<input
				on:change={(e) => onFileSelected(e)}
				bind:this={fileInput}
				style="display:none"
				accept=".jpg, .jpeg, .png"
				type="file"
			/>
			<Rich bind:editor />
			<button type="submit">Publicar noticia </button>
		</Form>
	</div>
</section>

<style>
	.News {
		margin: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 400px;
	}

	.News__contain {
		max-width: 650px;
	}

	input,
	textarea {
		width: 100%;
		background: transparent;
		border: none;
		resize: none;
		padding-bottom: 10px;
	}

	img {
		width: 100%;
		max-height: 400px;
		object-fit: cover;
		cursor: pointer;
		margin-bottom: 30px;
	}

	button {
		margin-top: 20px;
		background: var(--color-news-black);
		color: white;
		padding: 10px 15px;
	}

	input:focus,
	textarea:focus {
		outline: none;
	}

	input {
		font-weight: 900;
		font-size: 2rem;
		font-size: 'Karla', sans-serif;
		word-spacing: -8px;
		padding-top: 50px;
		color: var(--color-news-black);
	}

	textarea {
		font-size: 1rem;
		border-bottom: 2px solid #ebebeb;
		margin-bottom: 25px;
	}
</style>
