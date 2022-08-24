<script lang="ts">
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import { variables } from '$lib/variables'

	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import downloadFileURL from '$utils/downloadFileURL'
	import { UserTypes } from '$models/users/user_type.model'

	export let pathname: string
	export let user_type: string
	export let token: string

	let base = '/aula_virtual'

	async function downloadGrades() {
		try {
			const dataFetch: any = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/grades/download_grades`,
				true,
				token,
				{
					responseType: 'arraybuffer',
					headers: {
						'content-type': 'application/json',
					},
				},
			)
			const blob = new Blob([dataFetch], {
				type: 'application/pdf',
			})
			const url = window.URL.createObjectURL(blob)
			downloadFileURL(url, `uwu.pdf`)
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<nav class="Classroom__menu">
	<a class:Selected={pathname === base} sveltekit:prefetch href="/aula_virtual">
		<i class="fa-solid fa-chalkboard" />
	</a>
	{#if user_type === UserTypes.STUDENT || user_type === UserTypes.STUDENT_DIRECTIVE}
		<a
			class:Selected={pathname === `${base}/tareas`}
			sveltekit:prefetch
			href="/aula_virtual/tareas"
		>
			<i class="fa-solid fa-thumbtack" />
		</a>
		<ButtonIcon
			title={'Exportar a PDF Calificaciones'}
			classItem={'fa-solid fa-marker'}
			clickFunction={downloadGrades}
		/>
		<a
			class:Selected={pathname === `${base}/historial`}
			sveltekit:prefetch
			href="/aula_virtual/historial"
		>
			<i class="fa-solid fa-clock-rotate-left" />
		</a>
	{:else if user_type === UserTypes.TEACHER}
		<a
			class:Selected={pathname === `${base}/formularios`}
			sveltekit:prefetch
			href="/aula_virtual/formularios"
		>
			<i class="fa-solid fa-clipboard" />
		</a>
	{/if}
</nav>

<style>
	.Classroom__menu {
		padding: 10px;
		display: flex;
		width: 100%;
		justify-content: space-around;
		box-sizing: border-box;
		border: 2px solid var(--color-main);
	}

	a:hover i {
		color: var(--color-main);
	}

	i {
		transition: all 0.4s;
	}

	.Selected i {
		color: var(--color-main);
	}
</style>
