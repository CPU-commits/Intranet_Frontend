<script lang="ts" context="module">
	export async function load({ session, params, url }) {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/modules/get_module/${params.module}`,
				false,
				session.user.token,
			)
			const panel = {
				isPanel:
					!url.pathname.includes('trabajos') &&
					!url.pathname.includes('calificaciones') &&
					!url.pathname.includes('buscar'),
				section: url.searchParams.get('section') ? url.searchParams.get('section') : 0,
			}
			return {
				status: 200,
				props: {
					moduleData: dataFetch.body.module,
					url: url.pathname,
					panel,
					user_type: session.user.user_type,
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
	export let moduleData: ClassroomModules
	export let url: string
	export let user_type: string
	export let panel: Panel
	export let token: string

	import Header from '$components/Classroom/Header.svelte'
	import { variables } from '$lib/variables'
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { Panel } from '$models/classroom/panel.model'
	import API from '$utils/APIModule'
</script>

<Header {panel} {token} {user_type} {url} {moduleData} />

<slot />
