<script lang="ts">
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import ButtonText from '$components/HTML/ButtonText.svelte'
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'
	import type { Work } from '$models/classroom/work.model'
	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { formatDate, timeAgo } from '$utils/format'

	export let work: Work
	export let user_type: string
	export let token: string

	let open = false
	// Modal
	let modalDelete = false
	const toggleDelete = () => (modalDelete = !modalDelete)

	let workNode: HTMLElement

	async function deleteWork() {
		try {
			await API.fetchDeleteData(
				`${variables.API_CLASSROOM_WRITE}/api/classroom/works/delete_work/${work._id}`,
				true,
				token,
			)
			modalDelete = false
			workNode.parentNode.removeChild(workNode)
			addToast({
				message: 'Se ha eliminado el trabajo exitosamente',
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

<article bind:this={workNode} class="Work">
	{#if new Date().getTime() > new Date(work.date_limit).getTime()}
		<aside class="Topleft">
			{#if user_type === UserTypes.TEACHER}
				<ButtonIcon
					clickFunction={() => (open = !open)}
					classItem={'fa-solid fa-ellipsis-vertical'}
				/>
				<div class="Work__config" class:Work__config--open={open}>
					<a href="trabajos/editar/{work._id}"
						><i class="fa-solid fa-pen-to-square" /> Editar</a
					>
					<button
						on:click={() => {
							toggleDelete()
							open = false
						}}><i class="fa-solid fa-trash-can" /> Eliminar</button
					>
				</div>
			{/if}
		</aside>
	{/if}
	<a href="trabajos/{work._id}">
		<header>
			<h3>
				{@html work.type === 'form'
					? '<i class="fa-solid fa-clipboard"></i>'
					: '<i class="fa-solid fa-file-arrow-up"></i>'}
				{work.title}
			</h3>
			{#if work.is_qualified}
				<div class="Grade">
					<small
						><i class="fa-solid fa-certificate" /> Calificado ({work.grade.number}° -
						{work.grade.percentage}%)
					</small>
					{#if work.grade.is_acumulative}
						<small>
							Calificación acumulativa {work.grade.acumulative[0].number}° -
							{work.grade.acumulative[0].percentage}%
						</small>
					{/if}
				</div>
			{/if}
		</header>
		<section class="Work__body">
			{#if work.is_revised}
				<small class="Revised"
					><i class="fa-solid fa-circle-check" /> Trabajo revisado</small
				>
			{/if}
			{#if new Date().getTime() < new Date(work.date_start).getTime()}
				<p>Fecha apertura trabajo: {formatDate(work.date_start)}</p>
			{/if}
			<span>Fecha cierre trabajo: {formatDate(work.date_limit)}</span>
		</section>
		<footer>
			<small>Publicado por <span>{work.author.name} {work.author.first_lastname}</span></small
			>
			<small
				>{timeAgo(work.date_upload)}
				{#if work.date_upload !== work.date_update}(editado){/if}</small
			>
		</footer>
	</a>
</article>

{#if modalDelete}
	<Modal onClose={toggleDelete}>
		<h2 slot="title">Eliminar trabajo</h2>
		<div class="Modal">
			<span>¿Est&aacute;s seguro de querer eliminar este trabajo?</span>
			<div class="Buttons">
				<ButtonText color={'var(--color-danger)'} click={deleteWork}
					>S&iacute;, eliminar trabajo</ButtonText
				>
				<ButtonText color={'var(--color-dark)'} click={toggleDelete}
					>No, no eliminar trabajo</ButtonText
				>
			</div>
		</div>
	</Modal>
{/if}

<style lang="scss">
	a {
		text-decoration: none;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	.Work {
		position: relative;
		padding: 15px;
		border-bottom: 1px solid var(--color-light);
	}

	header {
		display: flex;
		justify-content: space-between;
	}

	h3 {
		transition: all 0.4s;
	}

	.Topleft {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 5px;
		position: absolute;
		right: 0;
		top: 12px;
	}

	.Work__config {
		position: absolute;
		background-color: white;
		top: 0;
		right: 10px;
		padding: 5px 10px;
		z-index: 4;
		border: 1px solid var(--color-light);
		display: none;
	}

	.Work__config--open {
		display: block;
	}

	.Work__config button,
	.Work__config a {
		padding: 3px 0;
		width: 100%;
		display: flex;
		gap: 5px;
		transition: all 0.4s;
		font-size: 0.8rem;
		text-decoration: none;
		i {
			transition: all 0.4s;
		}
	}

	.Work__config a:hover {
		color: var(--color-news);
		i {
			color: var(--color-news);
		}
	}

	.Work__config button:hover {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	aside button,
	aside a {
		border: none;
		background-color: transparent;
	}

	.Grade {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.Work__body {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	small i,
	header i {
		color: var(--color-main);
	}

	footer {
		display: flex;
		margin-top: 15px;
		justify-content: space-between;
	}

	footer small span {
		color: var(--color-main);
	}

	.Revised {
		width: 100%;
		color: var(--color-main);
		font-weight: bold;
	}

	.Modal {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.Buttons {
		display: flex;
	}
</style>
