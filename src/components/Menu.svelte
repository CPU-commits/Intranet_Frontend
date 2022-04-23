<script lang="ts">
	import type { UserSession } from '$models/userSession.model'

	export let user: UserSession
	export let authenticated: boolean
</script>

<nav class="Menu">
	<section class="Menu__content">
		<div class="Menu__content--left">
			<button class="InvisibleButton">
				<i class="fa-solid fa-bars" />
			</button>
			<h2>CSAH Intranet</h2>
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
			<button class="InvisibleButton">
				<i class="fa-solid fa-bell" />
			</button>
			<button class="InvisibleButton">
				<i class="fa-solid fa-user" />
			</button>
			{#if user?.user_type === 'd' || user?.user_type === 'f'}
				<button class="InvisibleButton">
					<i class="fa-solid fa-gear" />
				</button>
			{/if}
		</div>
	</section>
</nav>

<style>
	.Menu {
		width: 100%;
		height: 60px;
		box-shadow: rgb(71 75 255 / 10%) 0px 2px 4px;
		z-index: 10;
		background-color: white;
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

	a {
		font-family: 'Karla', sans-serif;
		color: var(--color-dark);
		font-size: 1.1rem;
		text-decoration: none;
	}

	.Menu__content--right {
		display: flex;
		gap: 20px;
		width: 200px;
	}

	button {
		color: var(--color-main);
		font-size: 1.1rem;
	}
</style>
