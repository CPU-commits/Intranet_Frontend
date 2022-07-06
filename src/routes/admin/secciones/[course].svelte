<script lang="ts" context="module">
	export function load({ session, params }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
				courseId: params.course,
			},
		}
	}
</script>

<script lang="ts">
	export let token: string
	export let courseId: string

	import Icons from '$components/Admin/Icons.svelte'

	import Panel from '$components/Admin/Panel.svelte'
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import InputFiles from '$components/HTML/InputFiles.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Table from '$components/HTML/Table.svelte'
	import Modal from '$components/Modal.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { Course, Section } from '$models/admin/courses.model'
	import type { Teacher } from '$models/admin/teacher.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { onMount } from 'svelte'
	// Modals
	let modal = false
	const toggleModal = () => (modal = !modal)
	// Data
	let teachers: Teacher[]
	let sections: Section[]
	let course: Course
	// Forms
	let section = ''
	let files: FileList
	let editFile: Array<HTMLInputElement> = []

	onMount(async () => {
		try {
			const dataFetch = await Promise.all([
				API.fetchGetData(
					`${variables.API}/api/teachers/get_teachers?total=false&skip=0`,
					false,
					token,
				),
				API.fetchGetData(
					`${variables.API}/api/course/get_sections_course/${courseId}`,
					false,
					token,
				),
				API.fetchGetData(
					`${variables.API}/api/course/get_course/${courseId}`,
					false,
					token,
				),
			]).then((data) => {
				return {
					teachers: data[0].body.users,
					sections: data[1].body.sections,
					course: data[2].body.course,
				}
			})
			// Asign
			teachers = dataFetch.teachers
			sections = dataFetch.sections
			course = dataFetch.course
		} catch (err) {
			teachers = []
			sections = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
	// Sections
	async function newSection() {
		try {
			if (section === '' || section.length > 100)
				throw new Error('Debe existir una sección con máx. 100 cárac.')
			if (files.length === 0) throw new Error('Debes subir una imágen')
			const form = new FormData()
			form.append('section', section)
			form.append('image', files[0])
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API}/api/course/new_section/${courseId}`,
				form,
				true,
				undefined,
				token,
			)
			// New values
			section = ''
			sections = [dataFetch.body.section, ...sections]
			addToast({
				message: 'Se ha agregado la sección exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function addTeacher(e: KeyboardEvent, index: number) {
		const target = e.target as HTMLInputElement
		try {
			let url = `${variables.API}/api/course`
			if (target.value !== '') {
				url += `/add_teacher_section/${target.value}/${target.dataset.id}`
			} else {
				url += `/remove_teacher_section/${target.dataset.id}`
			}
			await API.fetchData('post', url, undefined, true, undefined, token)
			if (target.value !== '') sections[index].header_teacher = target.value
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function deleteSection(id: string) {
		try {
			await API.fetchDeleteData(
				`${variables.API}/api/course/delete_section/${id}`,
				true,
				token,
			)
			// Delete
			sections = sections.filter((section) => {
				if (section._id !== id) return section
			})
			addToast({
				message: 'Se ha eliminado la sección exitosamente',
				type: 'success',
			})
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function changeFile(sectionId: string, index: number) {
		try {
			if (!editFile[index].files[0]?.type?.includes('image'))
				throw new Error('Debe seleccionar una imágen')
			const form = new FormData()
			form.append('image', editFile[index].files[0])
			const dataFetch = await API.fetchData(
				'put',
				`${variables.API}/api/course/change_image/${sectionId}`,
				form,
				true,
				undefined,
				token,
			)
			sections[index].file.url = dataFetch.body
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
		<ButtonIcon
			clickFunction={toggleModal}
			title={'Agregar curso'}
			classItem={'fa-solid fa-plus'}
		/>
	</Icons>
	<h2>
		Secciones {#if course}{course.course}{/if}
	</h2>
	<br />
	{#if sections}
		<Table header={['Sección', 'Imágen', 'Profesor jefe', '']}>
			{#each sections as section, i}
				<tr>
					<td>{section.section}</td>
					<td>
						<input
							on:change={() => changeFile(section._id, i)}
							bind:this={editFile[i]}
							type="file"
						/>
						<img
							on:click={() => editFile[i].click()}
							src={section.file.url}
							alt={section.section}
						/>
					</td>
					<td>
						<Select
							dataId={section._id}
							change={(e) => addTeacher(e, i)}
							value={section?.header_teacher ? section.header_teacher : ''}
							id={'teacher'}
						>
							<option value="">Sin asignar</option>
							{#each teachers as teacher}
								<option value={teacher._id}
									>{teacher.user.name} {teacher.user.first_lastname}</option
								>
							{/each}
						</Select>
					</td>
					<td>
						<ButtonIcon
							title={'Eliminar sección'}
							clickFunction={() => {
								deleteSection(section._id)
							}}
							classItem={'fa-solid fa-minus'}
						/>
					</td>
				</tr>
			{:else}
				<td>No hay datos...</td>
			{/each}
		</Table>
	{:else}
		<SpinnerGet />
	{/if}
</Panel>

<!-- Modals -->
{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Agregar secci&oacute;n</h2>
		<Form form={newSection}>
			<label for="section">Nombre secci&oacute;n</label>
			<Input bind:value={section} id={'section'} />
			<label for="file">Im&aacute;gen</label>
			<InputFiles
				filter={{
					filter: true,
					type: 'image',
					message: 'Debe seleccionar una imagen',
				}}
				accept={'.jpg, .jpeg, .png'}
				bind:files
				id={'file'}
			/>
			<Button type={'submit'}>Agregar secci&oacute;n</Button>
		</Form>
	</Modal>
{/if}

<style>
	img {
		width: 100px;
		height: 80px;
		object-fit: cover;
		border: 2px solid var(--color-light);
		cursor: pointer;
	}

	input {
		display: none;
	}
</style>
