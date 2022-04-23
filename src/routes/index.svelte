<script lang="ts">
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Button from '$components/HTML/Button.svelte'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { goto } from '$app/navigation'

	// User
	let userForm = {
		rut: '',
		password: '',
	}

	async function logIn() {
		try {
			await API.fetchData('post', '/auth/login', userForm)
			goto('/inicio')
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<section class="Session">
	<div class="Session__content">
		<Form form={logIn}>
			<label for="rut">RUT</label>
			<Input bind:value={userForm.rut} id={'rut'} type={'text'} />
			<label for="password">Contraseña</label>
			<Input bind:value={userForm.password} id={'password'} type={'password'} />
			<Button type={'submit'}>Iniciar sesi&oacute;n</Button>
		</Form>
	</div>
</section>

<style lang="scss">
	.Session {
		margin: 20px;
		display: flex;
		justify-content: center;
		.Session__content {
			background-color: white;
			padding: 20px;
			width: 400px;
			border-radius: 15px;
			box-shadow: var(--box-shadow);
		}
	}
</style>
