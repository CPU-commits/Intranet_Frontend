<script lang="ts" context="module">
	export async function load({ session, url }) {
		const URLs = ['/']
		if (!URLs.some((u) => u === url.pathname) && !session.authenticated) {
			return {
				status: 302,
				redirect: `/?redirect=${url.pathname}`,
			}
		}
		return {
			status: 200,
			props: {
				authenticated: session.authenticated,
				user: session.user,
				url: url.pathname,
			},
		}
	}
</script>

<script lang="ts">
	export let user: UserSession
	export let authenticated: boolean
	export let url: string

	import Menu from '$components/Menu.svelte'
	import Toasts from '$components/Toast/Toasts.svelte'
	import type { UserSession } from '$models/userSession.model'
	import { spinner } from '$stores/stores'
	import Loading from '$components/Loading.svelte'
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
