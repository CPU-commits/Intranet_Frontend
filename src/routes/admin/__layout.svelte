<script lang="ts" context="module">
	export function load({ url, session }) {
		if (
			session?.user?.user_type !== UserTypes.DIRECTOR &&
			session?.user?.user_type !== UserTypes.DIRECTIVE
		) {
			return {
				status: 302,
				redirect: '/',
			}
		}
		return {
			status: 200,
			props: {
				url: url.pathname,
				user_type: session.user.user_type,
			},
		}
	}
</script>

<script lang="ts">
	export let url: string
	export let user_type: string

	import AdminMenu from '$components/Admin/AdminMenu.svelte'
	import { UserTypes } from '$models/users/user_type.model'
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
