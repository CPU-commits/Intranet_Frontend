<script context="module">
	import { UserTypes } from '$models/users/user_type.model'

	export function load({ session }) {
		if (session.user.user_type !== UserTypes.TEACHER) {
			return {
				status: 401,
				error: 'No estás autorizado a esta ruta',
			}
		}
		return {
			status: 200,
		}
	}
</script>

<slot />
