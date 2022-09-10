<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	// Components
	import Booklife from '$components/Booklife/Booklife.svelte'
	import { page } from '$app/stores'

	let token = data.user.token
	let idStudent = $page.params.student
	let userType = data.user.user_type
	let idUser = data.user._id
</script>

<section class="BookLife">
	<h2>Libro de vida</h2>
	<Booklife {idUser} {idStudent} {userType} {token} />
</section>

<style>
	.BookLife {
		margin: 20px;
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
		border-radius: 15px;
	}

	h2 {
		margin-bottom: 15px;
	}
</style>
