<script lang="ts" context="module">
	export async function load({ session, url }) {
		const URLs = ['/']
		if (!URLs.some((u) => u === url.pathname) && !session.authenticated) {
			return {
				status: 302,
				redirect: '/',
			}
		}
		return {
			status: 200,
			props: {
				authenticated: session.authenticated,
				user: session.user,
			},
		}
	}
</script>

<script lang="ts">
	export let user: UserSession
	export let authenticated: boolean

	import Menu from '$components/Menu.svelte'
	import Toasts from '$components/Toast/Toasts.svelte'
	import type { UserSession } from '$models/userSession.model'
	import { spinner } from '$stores/stores'
	import Loading from '$components/Loading.svelte'
</script>

<!-- Menu -->
<Menu {user} {authenticated} />

<Toasts />

{#if $spinner}
	<Loading />
{/if}

<main>
	<slot />
</main>
