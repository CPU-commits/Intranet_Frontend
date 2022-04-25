<script lang="ts" context="module">
	import { UserTypes } from '$models/users/user_type.model'

	export function load({ session }) {
		if (session?.user?.user_type !== UserTypes.DIRECTOR) {
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
