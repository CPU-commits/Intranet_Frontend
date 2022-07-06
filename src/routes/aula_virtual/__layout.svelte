<script lang="ts" context="module">
	import { UserTypes } from '$models/users/user_type.model'

	export function load({ session }) {
		if (
			session?.user?.user_type !== UserTypes.STUDENT_DIRECTIVE &&
			session?.user?.user_type !== UserTypes.STUDENT &&
			session?.user?.user_type !== UserTypes.TEACHER
		) {
			return {
				status: 302,
				redirect: '/',
			}
		}
		return {
			status: 200,
		}
	}
</script>

<slot />
