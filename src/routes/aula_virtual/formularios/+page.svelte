<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { UserForm } from '$models/classroom/form.model'
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { page } from '$app/stores'
	// Components
	import ClassroomMenu from '$components/Classroom/ClassroomMenu.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'
	import { timeAgo } from '$utils/format'

	let token = data.user.token
	let pathname = $page.url.pathname
	let user_type = data.user.user_type

	// Data
	let forms: Array<UserForm>
	let all = false

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_CLASSROOM_READ}/api/classroom/forms/get_forms`,
				false,
				token,
			)
			forms = dataFetch.body.forms
		} catch (err) {
			forms = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<section class="Forms">
	<ClassroomMenu {user_type} {token} {pathname} />
	<br />
	<h2><i class="fa-solid fa-clipboard" /> Formularios</h2>
	<section class="Forms__yours">
		<h3>Tus formularios</h3>
		{#if forms}
			<section class="UserForms">
				{#each forms as form, i}
					{#if (i > 6 && all) || i <= 6}
						<a href="/aula_virtual/formularios/{form._id}" class="Form">
							<h4>{form.title}</h4>
							<span>Tipo: {form.has_points ? 'Con puntaje' : 'Sin puntaje'}</span>
							<small>{timeAgo(form.upload_date)}</small>
						</a>
					{/if}
				{:else}
					<span>No hay formularios...</span>
				{/each}
			</section>
			{#if forms.length > 6}
				<ButtonText click={() => (all = !all)}>Ver todos</ButtonText>
			{/if}
		{:else if forms === undefined}
			<SpinnerGet />
		{:else}
			<span>No hay formularios...</span>
		{/if}
	</section>
	<a href="/aula_virtual/formularios/nuevo"
		><i class="fa-solid fa-feather-pointed" /> Crear un nuevo formulario</a
	>
</section>

<style>
	.Forms {
		margin: 20px;
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
		border-radius: 10px;
	}

	.Forms__yours {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.UserForms {
		margin: 10px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 20px;
	}

	.Form {
		border: 2px solid var(--color-light);
		padding: 15px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		min-width: 200px;
		align-items: center;
	}

	h4 {
		transition: all 0.4s ease;
		font-size: 1.1rem;
	}

	.Form:hover h4 {
		color: var(--color-main);
	}

	.Form span {
		margin-top: 10px;
		font-size: 0.9rem;
	}

	.Form small {
		font-size: 0.75rem;
	}

	i {
		color: var(--color-main);
	}
</style>
