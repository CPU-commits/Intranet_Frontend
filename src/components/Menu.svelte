<script lang="ts">
	import type { UserSession } from '$models/userSession.model'
	import { onMount } from 'svelte'
	import Notifications from './Notifications.svelte'

	export let user: UserSession
	export let authenticated: boolean
	export let url: string

	let menuOpen = false
	let body: HTMLBodyElement

	onMount(() => {
		body = document.body as HTMLBodyElement
	})

	function toggleMenu() {
		if (!open) {
			body.style.overflowY = 'hidden'
		} else {
			body.style.overflowY = 'initial'
		}
		menuOpen = !menuOpen
	}

	function ahref() {
		body.style.overflowY = 'initial'
		menuOpen = false
	}
</script>

<nav class="Header" class:News={url.startsWith('/noticias')}>
	<section class="Header__content">
		<div class="Header__content--left">
			<button on:click={toggleMenu} class="InvisibleButton">
				<i class="fa-solid fa-bars" />
			</button>
			<a href="/">
				<h2>CSAH Intranet</h2>
			</a>
		</div>
		<div class="Header__content--main">
			{#if authenticated}
				<ul>
					<li>
						<a href="/aula_virtual" sveltekit:prefetch> Aula virtual </a>
					</li>
					<li>
						<a href="/noticias" sveltekit:prefetch> Noticias </a>
					</li>
					<li>
						<a href="/libro_vida" sveltekit:prefetch> Libro de vida </a>
					</li>
				</ul>
			{/if}
		</div>
		<div class="Header__content--right">
			{#if authenticated}
				<Notifications user_type={user.user_type} {url} token={user.token} />
			{/if}
			<a href="/usuario">
				<i class="fa-solid fa-user" />
			</a>
			{#if user?.user_type === 'd' || user?.user_type === 'f'}
				<a href="/admin">
					<i class="fa-solid fa-gear" />
				</a>
			{/if}
		</div>
	</section>
</nav>

<menu class="Menu" class:Opened={menuOpen}>
	<div class="Menu__container" class:Menu__opened={menuOpen}>
		<header class="Menu__header">
			<div class="Menu__header--title">
				<button on:click={toggleMenu}>
					<i class="fa-solid fa-bars" />
				</button>
				<a on:click={ahref} href="/" sveltekit:prefetch>
					<h2>CSAH Intranet</h2>
				</a>
			</div>
		</header>
		<ul>
			<a on:click={ahref} href="/inicio">
				<li class:selected={url === '/inicio'}>
					<i class="fa-solid fa-house" /> <span>Inicio</span>
				</li>
			</a>
			<a on:click={ahref} href="/aula_virtual">
				<li class:selected={url.startsWith('/aula_virtual')}>
					<i class="fa-solid fa-chalkboard" /> <span>Aula virtual</span>
				</li>
			</a>
			<a on:click={ahref} href="/noticias">
				<li class:selected={url.startsWith('/noticias')}>
					<i class="fa-solid fa-newspaper" /> <span>Noticias</span>
				</li>
			</a>
			<a on:click={ahref} href="/biblioteca">
				<li class:selected={url.startsWith('/biblioteca')}>
					<i class="fa-solid fa-book-bookmark" /> <span>Biblioteca virtual</span>
				</li>
			</a>
			<a on:click={ahref} href="/libro_vida">
				<li class:selected={url.startsWith('/libro_vida')}>
					<i class="fa-solid fa-book-open" /> <span>Libro de vida</span>
				</li>
			</a>
			<a on:click={ahref} href="/bienestar_estudiantil">
				<li class:selected={url.startsWith('/bienestar_estudiantil')}>
					<i class="fa-solid fa-handshake-angle" /> <span>Bienestar estudiantil</span>
				</li>
			</a>
			<a on:click={ahref} href="/votar">
				<li class:selected={url.startsWith('/votar')}>
					<i class="fa-solid fa-check-to-slot" /> <span>Votar</span>
				</li>
			</a>
			<a on:click={ahref} href="/soporte">
				<li class:selected={url.startsWith('/soporte')}>
					<i class="fa-solid fa-circle-info" /> <span>Soporte</span>
				</li>
			</a>
		</ul>
		<a href="/auth/close_session" class="logout">
			<i class="fa-solid fa-arrow-right-from-bracket" />
			Cerrar sesi&oacute;n
		</a>
	</div>
</menu>

<style lang="scss">
	.Header {
		width: 100%;
		height: 60px;
		box-shadow: rgb(71 75 255 / 10%) 0px 2px 4px;
		z-index: 10;
		background-color: white;
	}
	/* News */
	.News {
		background-color: var(--color-news-black);
		h2,
		i,
		a {
			color: white;
		}
	}

	h2,
	i {
		color: var(--color-main);
	}

	.Header__content {
		box-sizing: border-box;
		padding: 0 20px;
		width: 100%;
		height: 100%;
		justify-content: space-around;
		display: flex;
	}

	.Header__content--left {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 10px;
		width: 200px;
	}

	.Header__content--main {
		display: flex;
	}

	.Header__content--main ul {
		align-items: center;
		gap: 20px;
		list-style: none;
		display: flex;
	}

	a,
	button {
		background-color: transparent;
		border: none;
		font-family: 'Karla', sans-serif;
		color: var(--color-dark);
		text-decoration: none;
		i {
			font-size: 1rem;
		}
	}

	.Header__content--right {
		display: flex;
		align-items: center;
		gap: 20px;
		width: 200px;
	}

	button {
		color: var(--color-main);
		font-size: 1.1rem;
		cursor: pointer;
	}

	// Menu
	.Menu {
		width: 200px;
		height: 100%;
		top: 0;
		left: 0;
		position: absolute;
		visibility: hidden;
		z-index: 10;
	}

	.Menu__container {
		width: 250px;
		background-color: white;
		box-shadow: var(--box-shadow);
		left: -250px;
		height: 100%;
		position: fixed;
		top: 0;
		transition: all 0.4s ease;
	}

	.Menu__header {
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 60px;
	}

	.Menu__header--title {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.Opened {
		visibility: visible;
	}

	.Menu__opened {
		left: 0;
	}

	.Menu ul {
		padding: 0px 15px;
		list-style: none;
	}

	.selected {
		color: var(--color-main);
		border-left: 3px solid var(--color-main) !important;
	}

	.selected i,
	.selected span {
		color: var(--color-main);
	}

	.Menu li {
		padding: 10px;
		cursor: pointer;
		font-size: 1.1rem;
		border-left: 3px solid transparent;
		transition: color 0.4s ease;
	}

	.Menu li a {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.Menu i,
	.Menu span {
		transition: color 0.4s ease;
	}

	.Menu li:hover i,
	.Menu li:hover span,
	.Menu li:hover {
		color: var(--color-main);
	}

	.Menu li:hover {
		border-left: 3px solid var(--color-main);
	}

	.logout {
		background: none;
		border: none;
		bottom: 25px;
		left: 25px;
		position: absolute;
		font-size: 1.1rem;
		transition: all 0.4s ease;
		cursor: pointer;
	}

	.logout:hover,
	.logout:hover i {
		color: var(--color-main);
	}
</style>
