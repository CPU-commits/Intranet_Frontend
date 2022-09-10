<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		publication: Publication
	}

	// Types
	import type { Publication } from '$models/classroom/publication.model'
	import type { Session } from '$models/session.model'
	// Stores
	import { page } from '$app/stores'
	// Components
	import PublicationComponent from '$components/Classroom/Publication.svelte'

	// Init variables
	let publication = data.publication
	let moduleId = $page.params.module
	let token = data.user.token
</script>

<section class="Publication">
	<PublicationComponent {moduleId} {publication} {token} />
</section>

<style>
	.Publication {
		margin: 20px;
	}
</style>
