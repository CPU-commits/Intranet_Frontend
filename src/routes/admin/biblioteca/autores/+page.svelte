<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Author } from '$models/library/author.model'
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	// Components
	import Icons from '$components/Admin/Icons.svelte'
	import Panel from '$components/Admin/Panel.svelte'
	import AIcon from '$components/HTML/AIcon.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import Table from '$components/HTML/Table.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	// Utils
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import { formatDate } from '$utils/format'

	// Init variable
	let token = data.user.token

	// Data
	let authors: Array<Author>

	onMount(async () => {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API_LIBRARY}/api/authors/get_authors`,
				false,
				token,
			)
			authors = dataFetch.body.authors
		} catch (err) {
			authors = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})

	async function deleteAuthor(_id: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API_LIBRARY}/api/authors/delete_author/${_id}`,
				true,
				token,
			)
			addToast({
				message: 'Se ha eliminado el autor exitosamente',
				type: 'success',
			})
			authors = authors.filter((author) => {
				if (author._id !== _id) return author
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<Panel>
	<Icons slot="nav">
		<AIcon
			title={'Nuevo autor'}
			href={'/admin/biblioteca/autores/nuevo_autor'}
			classItem={'fa-solid fa-plus'}
		/>
	</Icons>
	<h2>Autores</h2>
	<br />
	{#if authors}
		<Table header={['Nombre', 'Fecha', 'Ver entrada', 'Editar', '']}>
			{#each authors as author}
				<tr>
					<td>{author.name}</td>
					<td>{formatDate(author.date_update)}</td>
					<td>
						<AIcon
							href={`/biblioteca/autor/${author.slug}`}
							classItem={'fa-solid fa-pager'}
						/>
					</td>
					<td>
						<AIcon
							target={'_blank'}
							href={`/admin/biblioteca/autores/editar/${author.slug}`}
							classItem={'fa-solid fa-pen-to-square'}
						/>
					</td>
					<td>
						<ButtonIcon
							title={'Eliminar autor'}
							classItem={'fa-solid fa-circle-minus'}
							clickFunction={() => deleteAuthor(author._id)}
						/>
					</td>
				</tr>
			{:else}
				<tr>
					<td>Sin autores...</td>
				</tr>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>
