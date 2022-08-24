<script lang="ts" context="module">
	export function load({ url, session }) {
		const user_type = session.user.user_type
		if (user_type !== UserTypes.STUDENT && user_type !== UserTypes.STUDENT_DIRECTIVE)
			return {
				status: 401,
				error: 'No tienes acceso a esta ruta',
			}
		return {
			status: 200,
			props: {
				token: session.user.token,
				user_type: session.user.user_type,
				pathname: url.pathname,
			},
		}
	}
</script>

<script lang="ts">
	import ClassroomMenu from '$components/Classroom/ClassroomMenu.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { Work } from '$models/classroom/work.model'
	import { UserTypes } from '$models/users/user_type.model'

	import { addToast } from '$stores/toasts'

	import API from '$utils/APIModule'
	import { formatDate } from '$utils/format'

	import { onMount } from 'svelte'

	export let token: string
	export let user_type: string
	export let pathname: string

	let works: Array<Work & { status: number }>

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/works/get_modules_works`,
				false,
				token,
			)
			works = dataFetch.body.works
		} catch (err) {
			works = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	function stringStatus(status: number) {
		if (status === 0) return 'Sin abrir'
		if (status === 1) return 'Resolviendose'
		if (status === 2) return 'Entregado y finalizado'
	}
</script>

<section class="Classroom">
	<ClassroomMenu {pathname} {user_type} {token} />
	<section class="Classroom__works">
		{#if works}
			{#each works as work}
				<a href="/aula_virtual/clase/{work.module}/trabajos/{work._id}">
					<article class="Work">
						<header>
							<h3>
								{@html work.type === 'form'
									? '<i class="fa-solid fa-clipboard"></i>'
									: '<i class="fa-solid fa-file-arrow-up"></i>'}
								{work.title}
								{@html work.is_qualified
									? '<i title="Calificado" style="color:var(--color-main)" class="fa-solid fa-certificate"></i>'
									: ''}
							</h3>
						</header>
						<p>Desde: {formatDate(work.date_start)}</p>
						<p>Hasta: {formatDate(work.date_limit)}</p>
						<footer>
							<small>Subido: {formatDate(work.date_upload)}</small>
							<small
								>Estado <span class="Mark">{stringStatus(work.status)}</span></small
							>
						</footer>
					</article>
				</a>
			{:else}
				<span><i class="fa-solid fa-house-flag" /> Sin trabajos pendientes...</span>
			{/each}
		{:else}
			<SpinnerGet />
		{/if}
	</section>
</section>

<style>
	.Classroom {
		padding: 20px;
	}

	.Classroom__works {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
	}

	a {
		width: 100%;
		text-decoration: none;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	h3 {
		transition: all 0.4s;
	}

	.Work {
		width: 100%;
		display: flex;
		flex-direction: column;
		background-color: white;
		box-shadow: var(--box-shadow);
		border-radius: 10px;
		padding: 20px;
	}

	.Work footer {
		display: flex;
		justify-content: space-between;
	}

	.Mark {
		color: var(--color-main);
		font-weight: bold;
	}
</style>
