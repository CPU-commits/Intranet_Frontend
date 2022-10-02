<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Course, Section } from '$models/admin/courses.model'
	import type { Teacher } from '$models/admin/teacher.model'
	import type { Session } from '$models/session.model'
	// Svelte
	import { onMount } from 'svelte'
	// Stores
	import { page } from '$app/stores'
	import { addToast } from '$stores/toasts'
	// Components
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
	// Utils
	import { variables } from '$lib/variables'
	import API from '$utils/APIModule'

	// Init variables
	let token = data.user.token
	let courseId = $page.params.course
	// Modals
	let modal = false
	let modalSections = false
	const toggleModal = () => (modal = !modal)
	const toggleModalSections = () => (modalSections = !modalSections)
	// Data
	let teachers: Teacher[]
	let sections: Section[]
	let course: Course
	let nextCourse: Course
	let nextSections: Section[]
	// Selected
	let sectionSelected: Section
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

	async function getSectionsNextLevel() {
		try {
			const dataFetch = await API.fetchGetData(
				`${variables.API}/api/course/get_sections_next_level/${course._id}`,
				false,
				token,
			)
			nextCourse = dataFetch.body.course
			nextSections = dataFetch.body.sections
		} catch (err) {
			nextSections = []
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	async function selectNextSection(sectionData: Section = null) {
		try {
			let route = `${variables.API}/api/course/select_next_section/${sectionSelected._id}`
			if (sectionData) route += `?idNextSection=${sectionData._id}`
			await API.fetchData('put', route, undefined, true, undefined, token)

			sections = sections.map((section) => {
				if (section._id === sectionSelected._id) {
					if (sectionData)
						return {
							...section,
							next_section: sectionData,
							is_next_section_variable: false,
						}
					return {
						...section,
						next_section: null,
						is_next_section_variable: true,
					}
				}
				return section
			})
			modalSections = false
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
		Secciones
		{#if course}
			{course.course}
			{course.isFinal ? '(Curso final)' : ''}
		{/if}
	</h2>
	<br />
	{#if sections}
		<Table header={['Sección', 'Imágen', 'Sección sub-siguiente', 'Profesor jefe', '']}>
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
						{#if !course.isFinal}
							<div class="Next">
								{section.is_next_section_variable
									? 'Variable'
									: section?.next_section
									? `${section.next_section.section}`
									: 'Sin asignar'}
								<div>
									<ButtonIcon
										clickFunction={() => {
											sectionSelected = section
											getSectionsNextLevel()
											toggleModalSections()
										}}
										classItem={'fa-solid fa-arrows-turn-to-dots'}
									/>
								</div>
							</div>
						{:else}
							No aplica
						{/if}
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

{#if modalSections}
	<Modal onClose={toggleModalSections}>
		<h2 slot="title">Secciones sub-siguientes</h2>
		{#if nextSections}
			<h3>Curso {nextCourse.course} ({nextCourse.level}°)</h3>
			<br />
			<Table header={['Sección', 'Seleccionar como siguiente']}>
				{#each nextSections as section}
					<tr>
						<td>
							{section.section}
						</td>
						<td>
							<ButtonIcon
								selected={sectionSelected?.next_section?._id === section._id}
								clickFunction={() => selectNextSection(section)}
								classItem={'fa-solid fa-circle-check'}
							/>
						</td>
					</tr>
				{/each}
				<tr>
					<td>Variable</td>
					<td>
						<ButtonIcon
							selected={sectionSelected.is_next_section_variable}
							clickFunction={() => selectNextSection()}
							classItem={'fa-solid fa-circle-check'}
						/>
					</td>
				</tr>
			</Table>
		{:else}
			<SpinnerGet />
		{/if}
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

	.Next {
		display: flex;
		gap: 15px;
		justify-content: center;
	}
</style>
