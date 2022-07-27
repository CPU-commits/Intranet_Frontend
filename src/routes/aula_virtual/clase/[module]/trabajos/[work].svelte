<script context="module">
	export function load({ session, params }) {
		return {
			status: 200,
			props: {
				token: session.user.token,
				idWork: params.work,
				idModule: params.module,
				user_type: session.user.user_type,
			},
		}
	}
</script>

<script lang="ts">
	import File from '$components/Classroom/File.svelte'
	import Link from '$components/Classroom/Link.svelte'
	import WorkStudent from '$components/Classroom/Works/WorkStudent.svelte'
	import WorkTeacher from '$components/Classroom/Works/WorkTeacher.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import { variables } from '$lib/variables'
	import type { FilesUploadedClassroom } from '$models/classroom/files_uploaded.model'
	import type { FormAccess } from '$models/classroom/form_access.model'
	import type { Grade } from '$models/classroom/grade.model'
	import type { StudentAccess } from '$models/classroom/students_access.model'
	import type { Work } from '$models/classroom/work.model'
	import { UserTypes } from '$models/users/user_type.model'

	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { formatDate } from '$utils/format'

	import { onMount } from 'svelte'

	export let token: string
	export let idWork: string
	export let idModule: string
	export let user_type: string

	let work: Work
	let form_access: FormAccess
	let files_uploaded: FilesUploadedClassroom
	let students: Array<StudentAccess>
	let totalPoints: number
	let formHasPoints: boolean
	let grade: Grade
	let message: string

	onMount(async () => {
		try {
			const promises = [
				API.fetchGetData(
					`${variables.API_CLASSROOM_READ}/api/classroom/works/get_work/${idWork}`,
					false,
					token,
				),
			]
			if (user_type === UserTypes.TEACHER)
				promises.push(
					API.fetchGetData(
						`${variables.API_CLASSROOM_READ}/api/classroom/works/get_students_status/${idModule}/${idWork}`,
						false,
						token,
					),
				)
			const dataFetch = await Promise.all(promises)
			work = dataFetch[0].body.work
			form_access = dataFetch[0].body.form_access
			if (user_type === UserTypes.TEACHER) {
				formHasPoints = dataFetch[0].body.form_has_points
				students = dataFetch[1].body.students
				totalPoints = dataFetch[1].body.total_points
			} else {
				files_uploaded = dataFetch[0].body.files_uploaded
				grade = dataFetch[0].body.grade
			}
			// Fix obj null
			if (work.attached.length === 1 && work.attached[0]._id === '') work.attached = null
		} catch (err) {
			work = null
			message = err.message
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	})
</script>

<section class="Work">
	{#if work}
		<header>
			<h2>
				{@html work.type === 'form'
					? '<i class="fa-solid fa-clipboard"></i>'
					: '<i class="fa-solid fa-file-arrow-up"></i>'}
				{work.title}
			</h2>
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
		{#if work.description && work.description !== ''}
			<pre class="Work__description">{work.description}</pre>
		{/if}
		{#if work.attached && work.attached.length > 0}
			<section class="Work__attached">
				<h4><i class="fa-solid fa-paperclip" /> Adjunto</h4>
				{#each work.attached as attached}
					{#if attached.type === 'file'}
						<File {token} moduleId={idModule} minimalist={true} file={attached.file} />
					{:else if attached.type === 'link'}
						<Link
							minimalist={true}
							link={{ title: attached.title, link: attached.link }}
						/>
					{/if}
				{/each}
			</section>
		{/if}
		<section class="Work__content">
			{#if user_type === UserTypes.STUDENT || user_type === UserTypes.STUDENT_DIRECTIVE}
				<WorkStudent {idModule} {files_uploaded} {token} {grade} {form_access} {work} />
			{:else}
				<WorkTeacher {formHasPoints} {token} {totalPoints} {work} {idWork} {students} />
			{/if}
		</section>
		<footer>
			<small>Publicado por <span>{work.author.name} {work.author.first_lastname}</span></small
			>
			<small>Fecha cierre: {formatDate(work.date_limit)}</small>
		</footer>
	{:else if work === undefined}
		<SpinnerGet />
	{:else}
		<span>{message}</span>
	{/if}
</section>

<style>
	.Work {
		background-color: white;
		margin: 15px;
		padding: 15px;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.Work__description {
		padding: 10px;
		border-bottom: 2px solid var(--color-light);
	}

	.Work__attached {
		padding: 5px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	i {
		color: var(--color-main);
	}

	.Work__content {
		padding: 20px;
		border: 2px solid var(--color-light);
		margin: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	footer {
		display: flex;
		justify-content: space-between;
	}

	footer span {
		color: var(--color-main);
	}
</style>
