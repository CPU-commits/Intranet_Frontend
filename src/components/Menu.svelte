<script lang="ts">
	import type { UserSession } from '$models/userSession.model'
	import Notifications from './Notifications.svelte'

	export let user: UserSession
	export let authenticated: boolean
	export let url: string
</script>

<nav class="Menu" class:News={url.startsWith('/noticias')}>
	<section class="Menu__content">
		<div class="Menu__content--left">
			<button class="InvisibleButton">
				<i class="fa-solid fa-bars" />
			</button>
			<a href="/">
				<h2>CSAH Intranet</h2>
			</a>
		</div>
		<div class="Menu__content--main">
			{#if authenticated}
				<ul>
					<li>
						<a href="/aula_virtual" sveltekit:prefetch> Aula virtual </a>
					</li>
					<li>
						<a href="/noticias" sveltekit:prefetch> Noticias </a>
					</li>
					<li>
						<a href="/hoja_vida" sveltekit:prefetch> Libro de vida </a>
					</li>
				</ul>
			{/if}
		</div>
		<div class="Menu__content--right">
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

<style lang="scss">
	.Menu {
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

	.Menu__content {
		box-sizing: border-box;
		padding: 0 20px;
		width: 100%;
		height: 100%;
		justify-content: space-around;
		display: flex;
	}

	.Menu__content--left {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 10px;
		width: 200px;
	}

	.Menu__content--main {
		display: flex;
	}

	.Menu__content--main ul {
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

	.Menu__content--right {
		display: flex;
		align-items: center;
		gap: 20px;
		width: 200px;
	}

	button {
		color: var(--color-main);
		font-size: 1.1rem;
	}
</style>
