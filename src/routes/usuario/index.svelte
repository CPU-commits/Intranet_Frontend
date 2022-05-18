<script lang="ts" context="module">
	export function load({ url, session }) {
		return {
			status: 200,
			props: {
				url: url.pathname,
				user_type: session.user.user_type,
				token: session.user.token,
			},
		}
	}
</script>

<script lang="ts">
	export let url: string
	export let user_type: string
	export let token: string

	import User from '$components/User/User.svelte'
	import { onMount } from 'svelte'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import VerticalTable from '$components/HTML/VerticalTable.svelte'
	import type { AnyUser } from '$models/users/any_user.model'
	import Input from '$components/HTML/Input.svelte'
	import { UserTypes } from '$models/users/user_type.model'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	// Data
	let user: AnyUser
	// Form
	let email = ''

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/users/get_data`,
				true,
				token,
			)
			user = dataFetch.body.user
			email = user?.email
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function changeEmail() {
		try {
			await API.fetchData(
				'post',
				`${variables.API}/api/users/change_email`,
				{
					email,
				},
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha actualizado el email correctamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<User {url} {user_type}>
	<h2 slot="title">Datos personales</h2>
	<div class="Container">
		<section class="ContentData">
			{#if user}
				<VerticalTable>
					<tr>
						<td>Nombre</td>
						<td>{user.name}</td>
					</tr>
					<tr>
						<td>Apellido P.</td>
						<td>{user.first_lastname}</td>
					</tr>
					<tr>
						<td>Apellido M.</td>
						<td>{user.second_lastname}</td>
					</tr>
					<tr>
						<td>RUT</td>
						<td>{user.rut}</td>
					</tr>
					<tr>
						<td>Email</td>
						<td class="EmailInput">
							<Input id={'email'} bind:value={email} type={'email'} />
							<ButtonIcon
								clickFunction={changeEmail}
								classItem={'fa-solid fa-pen-to-square'}
							/>
						</td>
					</tr>
					{#if user_type === UserTypes.STUDENT || user_type === UserTypes.STUDENT_DIRECTIVE}
						<tr>
							<td>Curso</td>
							<td
								>{user?.course?.course
									? `${user.course.course.course} ${user.course.section}`
									: 'Sin asignar'}</td
							>
						</tr>
					{/if}
					{#if user_type === UserTypes.TEACHER}
						<tr>
							<td>Cursos impartidos</td>
							<td
								>{user.imparted
									.map((imparted) => {
										return `${imparted.course.course.course} ${imparted.course.section} ${imparted.subject.subject}`
									})
									.join(', ')}</td
							>
						</tr>
					{/if}
				</VerticalTable>
			{/if}
		</section>
	</div>
</User>

<style>
	.EmailInput {
		display: flex;
		gap: 30px;
		align-items: center;
		justify-content: center;
	}

	.Container {
		display: flex;
		justify-content: center;
	}

	.ContentData {
		max-width: 1000px;
	}
</style>
