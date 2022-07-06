<script lang="ts">
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'

	import type { News, NewsType } from '$models/news.model'
	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { timeAgo } from '$utils/format'

	export let news: News
	export let token: string
	export let user_type: string
	export let type: keyof typeof NewsType

	let openMenu = false
	let modal = false
	const toggleModal = () => (modal = !modal)

	let newsElement: HTMLElement

	function toogleLike() {
		if (!news.like) {
			news.likes++
		} else {
			news.likes--
		}
		news.like = !news.like
	}

	async function likeNews() {
		try {
			toogleLike()
			await API.fetchData(
				'post',
				`${variables.API_NEWS}/api/news/like_news/${news._id}`,
				undefined,
				false,
				undefined,
				token,
			)
		} catch (err) {
			let message: string
			if (news.like == true) {
				message = 'No se ha podido dar me gusta a la noticia'
			} else {
				message = 'No se ha podido quitar el me gusta a la noticia'
			}
			toogleLike()
			addToast({
				message,
				type: 'error',
			})
		}
	}

	async function deleteNews() {
		try {
			await API.fetchDeleteData(
				`${variables.API_NEWS}/api/news/delete_news/${news._id}`,
				true,
				token,
			)
			addToast({
				message: 'Se ha eliminado la noticia exitosamente',
				type: 'success',
			})
			modal = false
			newsElement.parentNode.removeChild(newsElement)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<article bind:this={newsElement} class="News">
	{#if (news.type === 'global' && type === 'global' && (user_type === UserTypes.DIRECTOR || user_type === UserTypes.DIRECTIVE)) || (news.type === 'student' && type === 'student' && user_type === UserTypes.STUDENT_DIRECTIVE)}
		<div class="News__config">
			<button
				on:click={() => {
					openMenu = !openMenu
				}}
			>
				<i class="fa-solid fa-ellipsis-vertical" />
			</button>
			<div class:News__config--open={openMenu} class="News__config--container">
				<a href="/noticias/editar/{news.url}"
					><i class="fa-solid fa-pen-to-square" /> Editar</a
				>
				<button
					on:click={() => {
						toggleModal()
						openMenu = !openMenu
					}}><i class="fa-solid fa-trash-can" /> Eliminar</button
				>
			</div>
		</div>
	{/if}
	<a class="News__content" href="/noticias/{news.url}">
		<section class="News__text">
			<div>
				<h3>{news.title}</h3>
				<p>{news.headline}</p>
			</div>
		</section>
		<img src={news.image.url} alt={news.title} />
	</a>
	<footer class="News__details">
		<button on:click={likeNews}>
			<i class:LikeAnimation={news.like} class="fa-solid fa-heart" />
		</button>
		<span>{news.likes}</span>
		<span>Escrito: {news.author.name} {news.author.first_lastname}</span>
	</footer>
	<small>{timeAgo(news.upload_date)}</small>
</article>

{#if modal}
	<Modal onClose={toggleModal}>
		<h3 slot="title">Eliminar noticia</h3>
		<section class="Modal">
			<h4>¿Est&aacute; seguro de eliminar la noticia?</h4>
			<div class="Modal__buttons">
				<button on:click={deleteNews}>S&iacute;, eliminar</button>
				<button on:click={toggleModal}>No, cancelar</button>
			</div>
		</section>
	</Modal>
{/if}

<style lang="scss">
	.News {
		width: 100%;
		max-width: 600px;
		border-top: 1px solid var(--color-news-black);
		border-bottom: 1px solid var(--color-news-black);
		position: relative;
	}

	.News__config {
		position: absolute;
		right: 5px;
		top: 5px;
	}

	.News__config--container {
		position: absolute;
		background-color: white;
		top: 0;
		right: 10px;
		padding: 5px 10px;
		z-index: 4;
		border: 1px solid var(--color-light);
		display: none;
	}

	.News__config--open {
		display: block;
	}

	.News__config--container button,
	.News__config--container a {
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

	.News__config--container a:first-child:hover {
		color: var(--color-news);
		i {
			color: var(--color-news);
		}
	}

	.News__config--container button:last-child:hover {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	h4 {
		text-align: center;
		margin-bottom: 20px;
	}

	.Modal__buttons {
		display: flex;
		justify-content: center;
	}

	.Modal button {
		padding: 20px;
	}

	.Modal button:first-child {
		color: var(--color-danger);
	}

	.News__text {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.News__content {
		text-decoration: none;
		margin: 20px;
		box-sizing: border-box;
		position: relative;
		display: flex;
		justify-content: space-between;
		position: relative;
	}

	.News__content:hover h3 {
		color: var(--color-news);
	}

	h3 {
		font-size: 1.3rem;
		margin-bottom: 10px;
		transition: all 0.4s;
	}

	h3:hover {
		color: var(--color-news);
	}

	p {
		font-size: 0.9rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	img {
		width: 150px;
		height: 90px;
		object-fit: cover;
	}

	footer {
		position: absolute;
		left: 20px;
		bottom: 5px;
		font-size: 0.8rem;
	}

	small {
		position: absolute;
		right: 5px;
		bottom: 5px;
		font-size: 0.7rem;
	}

	button {
		border: none;
		background-color: transparent;
	}

	i {
		cursor: pointer;
	}

	.LikeAnimation {
		color: var(--color-danger);
		animation: Like 0.5s;
	}

	@keyframes Like {
		from {
			transform: scale(0);
		}

		50% {
			transform: scale(1.2);
		}

		from {
			transform: scale(0);
		}
	}
</style>
