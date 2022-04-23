<script lang="ts" context="module">
	export async function load({ session }) {
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
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import Toasts from '$components/Toast/Toasts.svelte'
	import type { UserSession } from '$models/userSession.model'
	import { spinner } from '$stores/stores'
</script>

<!-- Menu -->
<Menu {user} {authenticated} />

<Toasts />

{#if $spinner}
	<SpinnerGet />
{/if}

<main>
	<slot />
</main>
