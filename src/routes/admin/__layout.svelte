<script lang="ts" context="module">
	export function load({ url }) {
		return {
			status: 200,
			props: {
				url: url.pathname,
			},
		}
	}
</script>

<script lang="ts">
	export let url: string

	import AdminMenu from '$components/Admin/AdminMenu.svelte'
</script>

<section class="Admin">
	<AdminMenu {url} />

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
