<script context="module">
	import { variables } from '$lib/variables'

	import API from '$utils/APIModule'

	export async function load({ session, params }) {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/publications/get_publication/${params.module}/${params.publication}`,
				true,
				session.user.token,
			)
			return {
				status: 200,
				props: {
					publication: dataFetch.body.publication,
					moduleId: params.module,
					token: session.user.token,
				},
			}
		} catch (err) {
			return {
				status: err.statusCode,
				error: err.message,
			}
		}
	}
</script>

<script lang="ts">
	import PublicationComponent from '$components/Classroom/Publication.svelte'
	import type { Publication } from '$models/classroom/publication.model'

	export let publication: Publication
	export let moduleId: string
	export let token: string
</script>

<section class="Publication">
	<PublicationComponent {moduleId} {publication} {token} />
</section>

<style>
	.Publication {
		margin: 20px;
	}
</style>
