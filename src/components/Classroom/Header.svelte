<script lang="ts">
	import Button from '$components/HTML/Button.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Modal from '$components/Modal.svelte'
	import { variables } from '$lib/variables'
	import type { ClassroomModules } from '$models/classroom/modules'
	import type { Panel } from '$models/classroom/panel.model'
	import { UserTypes } from '$models/users/user_type.model'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'

	export let moduleData: ClassroomModules
	export let url: string
	export let user_type: string
	export let token: string
	export let panel: Panel
	// Form
	let subSection: string = ''

	let modal = false
	const toggleModal = () => (modal = !modal)

	// Section
	async function addSection() {
		try {
			const dataFetch = await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/modules/new_sub_section/${moduleData._id}`,
				{ sub_section: subSection },
				true,
				undefined,
				token,
			)
			moduleData.sub_sections = [
				{
					name: subSection,
					_id: dataFetch.body.inserted_id,
				},
				...moduleData.sub_sections,
			]
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}
</script>

<header class="Header">
	<nav>
		<a
			class:Selected={!url.includes('trabajos') && !url.includes('calificaciones')}
			href="/aula_virtual/clase/{moduleData._id}"
		>
			Panel
		</a>
		<a
			class:Selected={url.includes('trabajos')}
			href="/aula_virtual/clase/{moduleData._id}/trabajos"
		>
			Trabajos
		</a>
		<a
			class:Selected={url.includes('calificaciones')}
			href="/aula_virtual/clase/{moduleData._id}/calificaciones"
		>
			Calificaciones
		</a>
		<a
			href="/aula_virtual/clase/{moduleData._id}/buscar"
			class:Selected={url.includes('buscar')}><i class="fa-solid fa-magnifying-glass" /></a
		>
	</nav>
	<section class="Header__subject">
		<h2>
			{moduleData.subject.subject}
			{#if user_type === UserTypes.TEACHER}
				- {moduleData.section.course.course} {moduleData.section.section}
			{/if}
		</h2>
		{#if panel.isPanel}
			<section class="Header__subject--sub_sections">
				{#if moduleData.sub_sections}
					{#each moduleData.sub_sections as subSection, i}
						<a
							href="/aula_virtual/clase/{moduleData._id}?section={i}"
							class="SubSection"
							class:ButtonSelected={i === parseInt(panel.section)}
						>
							{subSection.name}
						</a>
					{/each}
				{:else}
					<span>Sin sub-secciones...</span>
				{/if}
			</section>
			<div class="Header__subject--button">
				<ButtonIcon
					title={'Añadir sub-sección'}
					color={'white'}
					hover={'white'}
					clickFunction={toggleModal}
					classItem={'fa-solid fa-plus'}
				/>
			</div>
		{/if}
	</section>
</header>

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Añadir sub sección</h2>
		<Form form={addSection}>
			<label for="sub-section">Sub sección</label>
			<Input bind:value={subSection} id={'sub-section'} />
			<Button type={'submit'}>Añadir</Button>
		</Form>
	</Modal>
{/if}

<style lang="scss">
	nav {
		padding: 13px;
		display: flex;
		justify-content: space-evenly;
		background-color: white;
		position: relative;
		border-top: 2px solid var(--color-light);
	}

	a {
		text-decoration: none;
		font-family: 'Karla', sans-serif;
		transition: color 0.4s;
		i {
			transition: color 0.4s;
		}
	}

	a:hover {
		color: var(--color-main);
		text-decoration: underline;
		i {
			color: var(--color-main);
		}
	}

	.Selected {
		color: var(--color-main);
		text-decoration: underline;
	}

	.Header__subject {
		border-top: 2px solid var(--color-light);
		background-color: var(--color-main);
		padding: 10px;
		box-shadow: var(--box-shadow);
		position: relative;
		h2 {
			color: white;
			text-align: center;
			font-size: 1.2rem;
		}
	}

	span {
		color: white;
	}

	.Header__subject--sub_sections {
		margin-top: 10px;
		display: flex;
		gap: 20px;
		margin-right: 30px;
		overflow-x: auto;
		align-items: center;
	}

	.SubSection {
		color: white;
		background: transparent;
		border: none;
		padding: 5px 10px;
		border: 1px solid white;
		transition: all 0.4s ease;
		border-radius: 4px;
	}

	.SubSection:hover {
		background-color: white;
		color: var(--color-main);
	}

	.ButtonSelected {
		background-color: white;
		color: var(--color-main);
	}

	.Header__subject--button {
		position: absolute;
		right: 10px;
		bottom: 10px;
	}
</style>
