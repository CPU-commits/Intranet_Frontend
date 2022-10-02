<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: Session

	// Types
	import type { Session } from '$models/session.model'
	import type { History, HistoryTypeChange } from '$models/admin/history.model'
	import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
	import type { Semester } from '$models/admin/semester.model'
	import type { User } from '$models/users/users.model'
	// Components
	import Panel from '$components/Admin/Panel.svelte'
	import Table from '$components/HTML/Table.svelte'
	import SpinnerGet from '$components/SpinnerGet.svelte'
	import Error from '$components/Error.svelte'
	import Icons from '$components/Admin/Icons.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Modal from '$components/Modal.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Select from '$components/HTML/Select.svelte'
	// Utils
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'
	import { formatDate } from '$utils/format'
	import Input from '$components/HTML/Input.svelte'
	import Button from '$components/HTML/Button.svelte'

	// Init variables
	let token = data.user.token
	// Models
	let modal = false
	const toggleModal = () => (modal = !modal)
	// Promises
	let totalData: number = 0
	let promiseHistory: Promise<Array<History>> = getHistory(true)
	let promiseSemester: Promise<Array<Semester>> = getSemesters()
	let promisePersons: Promise<Array<User>> = getPersons()

	async function getHistory(total = false, limit = 30, skip = 0, extraQueryParams?: string) {
		let query = `?total=${total}&skip=${skip}&limit=${limit}`
		if (extraQueryParams) query += extraQueryParams
		const dataFetch: FetchResponse<{
			history: {
				history: Array<History>
				total: number
			}
		}> = await API.fetchGetData(
			`${variables.API}/api/history/get_history${query}`,
			false,
			token,
		)
		if (total) totalData = dataFetch.body.history.total
		return dataFetch.body.history.history
	}

	async function getSemesters() {
		const dataFetch: FetchResponse<{ semesters: Array<Semester> }> = await API.fetchGetData(
			`${variables.API}/api/semesters/get_semesters`,
			false,
			token,
		)
		return dataFetch.body.semesters
	}

	async function getPersons() {
		const dataFetch: FetchResponse<{ persons: Array<User> }> = await API.fetchGetData(
			`${variables.API}/api/users/get_persons_history`,
			false,
			token,
		)
		return dataFetch.body.persons
	}

	// Form
	let filters = {
		semester: '',
		type_change: '',
		person: '',
		date_type: '',
		specific_date: '',
		interval_date: {
			start_date: '',
			finish_date: '',
		},
	}

	function getTypeOfChange(type_change: keyof typeof HistoryTypeChange) {
		if (type_change === 'add') return 'Añadir'
		if (type_change === 'close') return 'Cerrar'
		if (type_change === 'delete') return 'Eliminar'
		if (type_change === 'dismiss') return 'Destituir'
		if (type_change === 'reintegrate') return 'Reintegrar'
		if (type_change === 'update') return 'Actualizar'
	}

	function applyFilters(getFilters = false) {
		let filtersQuery = ''
		if (filters.semester !== '') filtersQuery += `&semester=${filters.semester}`
		if (filters.type_change !== '') filtersQuery += `&change=${filters.type_change}`
		if (filters.person !== '') filtersQuery += `&person=${filters.person}`
		if (filters.date_type === 'specific')
			filtersQuery += `&specific_date=${filters.specific_date}`
		if (filters.date_type === 'interval')
			filtersQuery += `&date_start=${filters.interval_date.start_date}&date_finish=${filters.interval_date.finish_date}`
		if (getFilters) return filtersQuery
		promiseHistory = getHistory(true, undefined, 0, filtersQuery)
	}
</script>

<Panel>
	<Icons slot="nav">
		<ButtonIcon
			clickFunction={toggleModal}
			classItem={'fa-solid fa-filter'}
			title={'Filtros'}
		/>
	</Icons>
	<h2>Cambios historicos</h2>
	<Table
		header={['Cambio', 'Persona', 'Tipo de cambio', 'Justificación', 'Fecha']}
		navigate={{
			activate: true,
			max: 30,
			fn: (n) => {
				const filters = applyFilters(true)
				promiseHistory = getHistory(false, 30, 30 * n, filters)
			},
		}}
		bind:total={totalData}
	>
		{#await promiseHistory}
			<SpinnerGet />
		{:then histories}
			{#each histories as history}
				<tr>
					<td>{history.change}</td>
					<td>{history.who.name} {history.who.first_lastname}</td>
					<td>{getTypeOfChange(history.type_change)}</td>
					<td>{history.why ?? 'No aplica'}</td>
					<td>{formatDate(history.date)}</td>
				</tr>
			{/each}
		{:catch err}
			<Error {err} />
		{/await}
	</Table>
</Panel>

{#if modal}
	<Modal onClose={toggleModal}>
		<h2 slot="title">Filtros</h2>
		<Form form={() => applyFilters()}>
			<h3>Semestre</h3>
			{#await promiseSemester}
				<SpinnerGet />
			{:then semesters}
				<Select bind:value={filters.semester} id={'semester'}>
					<option value="">Cualquier semestre</option>
					{#each semesters as semester}
						<option value={semester._id}>{semester.year} {semester.semester}°</option>
					{/each}
				</Select>
			{:catch err}
				<Error {err} />
			{/await}
			<h3>Tipo de cambio</h3>
			<Select bind:value={filters.type_change} id={'type_change'}>
				<option value="">Cualquier tipo de cambio</option>
				<option value="add">Añadir</option>
				<option value="delete">Eliminar</option>
				<option value="update">Actualizar</option>
				<option value="dismiss">Destituir</option>
				<option value="reintegrate">Reintegrar</option>
				<option value="close">Cerrar</option>
			</Select>
			<h3>Persona</h3>
			{#await promisePersons}
				<SpinnerGet />
			{:then persons}
				<Select bind:value={filters.person} id={'person'}>
					<option value="">Cualquier persona</option>
					{#each persons as person}
						<option value={person._id}>
							{person.name}
							{person.first_lastname}
							{person.second_lastname}
						</option>
					{/each}
				</Select>
			{:catch err}
				<Error {err} />
			{/await}
			<h3>Fecha</h3>
			<Select bind:value={filters.date_type} id={'date_type'}>
				<option value="">Cualquier fecha</option>
				<option value="specific">Fecha especifica</option>
				<option value="interval">Intervalo de fechas</option>
			</Select>
			{#if filters.date_type === 'specific'}
				<Input bind:value={filters.specific_date} type={'date'} />
			{:else if filters.date_type === 'interval'}
				<h4>Fecha inicio</h4>
				<Input bind:value={filters.interval_date.start_date} type={'date'} />
				<h4>Fecha final</h4>
				<Input bind:value={filters.interval_date.finish_date} type={'date'} />
			{/if}
			<Button type={'submit'}>Aplicar filtros</Button>
		</Form>
	</Modal>
{/if}
