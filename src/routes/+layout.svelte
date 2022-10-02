<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	// Stores
	import { page } from '$app/stores'
	import { spinner } from '$stores/stores'
	// Components
	import Menu from '$components/Menu.svelte'
	import Toasts from '$components/Toast/Toasts.svelte'
	import Loading from '$components/Loading.svelte'
	// Init variables
	$: url = $page.url.pathname
	let user = data.user
	let authenticated = data.authenticated
</script>

<!-- Menu -->
<Menu {url} {user} {authenticated} />

<Toasts />

{#if $spinner}
	<Loading />
{/if}

<main>
	<div>
		<slot />
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
	}

	main div {
		width: 100%;
		max-width: 1600px;
	}
</style>
