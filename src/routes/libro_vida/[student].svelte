<script context="module">
	import { UserTypes } from '$models/users/user_type.model'

	export async function load({ session, params }) {
		try {
			const userType = session.user.user_type
			if (
				userType !== UserTypes.TEACHER &&
				userType !== UserTypes.DIRECTIVE &&
				userType !== UserTypes.DIRECTOR
			)
				return {
					status: 401,
					error: 'No estás autorizado a esta ruta',
				}
			return {
				status: 200,
				props: {
					token: session.user.token,
					idStudent: params.student,
					userType,
					idUser: session.user._id,
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
	import Booklife from '$components/Booklife/Booklife.svelte'

	export let token: string
	export let idStudent: string
	export let userType: string
	export let idUser: string
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
