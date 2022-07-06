<script lang="ts" context="module">
	import { variables } from '$lib/variables'
	import type { News } from '$models/news.model'

	import API from '$utils/APIModule'

	export async function load({ session, params }) {
		try {
			const news = await API.fetchGetData(
				`${variables.API_NEWS}/api/news/get_single_news/${params.news}`,
				false,
				session.user.token,
			)
			return {
				status: 200,
				props: {
					news: news.body.news,
					token: session.user.token,
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
	import Form from '$components/HTML/Form.svelte'
	import type Quill from 'quill'
	import { addToast } from '$stores/toasts'
	import RichInput from '$components/HTML/RichInput.svelte'
	import { deltaToHtml } from '$utils/quill'
	import { goto } from '$app/navigation'

	export let news: News
	export let token: string
	// News
	let newsCopy: News = JSON.parse(JSON.stringify(news))
	let fileInput: HTMLInputElement
	let quill: Quill

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
			newsCopy.image.url = e.target.result.toString()
		}
	}

	function buildForm() {
		const form = new FormData()
		if (news.title !== newsCopy.title) form.append('title', newsCopy.title)
		if (news.headline !== newsCopy.headline) form.append('headline', newsCopy.headline)
		if (news.body !== newsCopy.body) form.append('body', newsCopy.body)
		if (fileInput.files.length > 0) form.append('img', fileInput.files[0])
		return form
	}

	function validatorsNews() {
		if (newsCopy.title.length < 3 || newsCopy.title.length > 100)
			return { success: false, message: 'Debe existir un titulo de mín 3 cárac. y máx 100' }
		if (newsCopy.headline.length < 3 || newsCopy.headline.length > 500)
			return { success: false, message: 'Debe existir una bajada de mín 3 cárac. y máx 500' }
		if (newsCopy.body.length < 10)
			return { success: false, message: 'Debe existir un cuerpo de mín 10 cárac.' }
		return { success: true }
	}

	async function updateNews() {
		try {
			newsCopy.body = deltaToHtml(quill)
			const validators = validatorsNews()
			if (!validators.success) throw new Error(validators.message)
			await API.fetchData(
				'put',
				`${variables.API_NEWS}/api/news/update_news/${news._id}`,
				buildForm(),
				true,
				undefined,
				token,
			)
			goto('/noticias')
			addToast({
				type: 'success',
				message: 'Se ha actualizado la noticia exitosamente',
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
		<Form form={updateNews}>
			<input bind:value={newsCopy.title} placeholder="Titulo" type="text" />
			<textarea bind:value={newsCopy.headline} placeholder="Bajada" />
			<img
				on:click={() => fileInput.click()}
				title="Subir imagen"
				src={newsCopy.image.url}
				alt="Subir imagen"
			/>
			<input
				on:change={(e) => onFileSelected(e)}
				bind:this={fileInput}
				style="display:none"
				accept=".jpg, .jpeg, .png"
				type="file"
			/>
			<RichInput body={news.body} bind:value={quill} placeholder={'Cuerpo...'} />
			<button type="submit">Editar noticia </button>
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
