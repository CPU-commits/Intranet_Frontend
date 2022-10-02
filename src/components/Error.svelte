<script lang="ts">
	// Types
	type Error = {
		success: boolean
		statusCode?: number
		message: string
	}

	export let err: Error

	let src: string = '/img/error/500.svg'
	let message: string = 'Ha ocurrido un error'

	if (err.statusCode === 400) {
		src = '/img/error/400.svg'
		message = 'Ups... Parece que algo se olvidó'
	} else if (err.statusCode === 401) {
		src = '/img/error/401.svg'
		message = 'No estás autorizado a esta ruta'
	} else if (err.statusCode === 403) {
		src = '/img/error/403.svg'
		message = 'Parece que esta ruta ya no existe'
	} else if (err.statusCode === 404) {
		src = '/img/error/404.svg'
		message = 'Esta ruta no existe'
	}
</script>

<section class="Error">
	<h2>{message}</h2>
	{#if err.statusCode !== 404}
		<span>{err.message}</span>
	{/if}
	<img {src} alt={message} />
</section>

<style>
	.Error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}

	h2 {
		color: var(--color-main);
	}

	img {
		width: 100%;
		height: 300px;
	}
</style>
