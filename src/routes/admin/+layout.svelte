<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	// Stores
	import { page } from '$app/stores'
	// Components
	import AdminMenu from '$components/Admin/AdminMenu.svelte'

	// Init variables
	$: url = $page.url.pathname
	let user_type = data.user.user_type
</script>

<section class="Admin">
	<AdminMenu {url} {user_type} />

	<slot />
</section>

<style lang="scss">
	.Admin {
		width: 100%;
		box-sizing: border-box;
		padding: 30px;
		display: flex;
	}
</style>
