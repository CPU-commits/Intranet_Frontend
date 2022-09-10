<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session & {
		moduleData: ClassroomModules
		panel: Panel
	}

	// Types
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { Panel } from '$models/classroom/panel.model'
	import type { Session } from '$models/session.model'
	// Stores
	import { page } from '$app/stores'
	// Components
	import Header from '$components/Classroom/Header.svelte'

	// Init variables
	let moduleData = data.moduleData
	let url = $page.url.pathname
	let user_type = data.user.user_type
	let panel = data.panel
	let token = data.user.token
</script>

<Header {panel} {token} {user_type} {url} {moduleData} />

<slot />
