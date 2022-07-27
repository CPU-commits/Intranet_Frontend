<script lang="ts">
	export let token: string
	export let idModule: string

	import Icons from '$components/Admin/Icons.svelte'
	import Modal from '$components/Modal.svelte'
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Form from '$components/HTML/Form.svelte'
	import Button from '$components/HTML/Button.svelte'
	import Select from '$components/HTML/Select.svelte'
	import Input from '$components/HTML/Input.svelte'
	import { addToast } from '$stores/toasts'
	import API from '$utils/APIModule'
	import { variables } from '$lib/variables'

	let modalProgramGrades = false
	const toggleModalPG = () => (modalProgramGrades = !modalProgramGrades)

	type Acumulative = {
		percentage: string
		number?: number
	}

	let program = {
		number: '',
		percentage: '',
		is_acumulative: 'false',
		acumulative: [] as Acumulative[],
	}

	function addAcumulative() {
		program.acumulative = [
			...program.acumulative,
			{
				percentage: '',
			},
		]
	}

	function deleteAcumulative(index: number) {
		program.acumulative.splice(index, 1)
		program.acumulative = program.acumulative
	}

	function validateNumber(number: string, index?: number) {
		if (number === '')
			throw new Error(
				`Indique un porcentaje para la calificación ${
					index ? 'acumulativa ' + index + '°' : ''
				}`,
			)
		if (parseInt(number) <= 0 || Number.isInteger(number))
			throw new Error(
				`El porcentaje ${
					index ? 'de la calificación acumulativa ' + index + '°' : ''
				} debe ser entero y mayor a cero`,
			)
	}

	function validatorsProgram() {
		if (program.number === '') throw new Error('Seleccione un número de calificación')
		validateNumber(program.percentage)
		if (program.is_acumulative === 'true') {
			if (program.acumulative.length < 2)
				throw new Error('Deben existir mín. 2 calificaciones acumulativas')
			program.acumulative.forEach((acumulative, i) => {
				validateNumber(acumulative.percentage, i + 1)
			})
		}
	}

	async function uploadProgram() {
		try {
			validatorsProgram()
			console.log({
				number: parseInt(program.number),
				percentage: parseInt(program.percentage),
				is_acumulative: program.is_acumulative === 'true',
				acumulative: program.acumulative.map((ac, i) => {
					return {
						percentage: ac.percentage,
						number: i + 1,
					}
				}),
			})
			await API.fetchData(
				'post',
				`${variables.API_CLASSROOM_WRITE}/api/classroom/grades/upload_program/${idModule}`,
				{
					number: parseInt(program.number),
					percentage: parseInt(program.percentage),
					is_acumulative: program.is_acumulative === 'true',
					acumulative: program.acumulative.map((ac, i) => {
						return {
							percentage: parseInt(ac.percentage),
							number: i + 1,
						}
					}),
				},
				true,
				undefined,
				token,
			)
			addToast({
				message: 'Se ha subido exitosamente la programación',
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

<section class="Grades">
	<header>
		<Icons>
			<ButtonIcon
				title={'Programar calificaciones'}
				clickFunction={toggleModalPG}
				classItem={'fa-solid fa-flag'}
			/>
			<ButtonIcon
				title={'Ver programación calificaciones'}
				clickFunction={3}
				classItem={'fa-solid fa-chart-pie'}
			/>
		</Icons>
	</header>
	<h2>Calificaciones</h2>
</section>

{#if modalProgramGrades}
	<Modal onClose={toggleModalPG}>
		<h2 slot="title">Programar calificaci&oacute;n</h2>
		<Form form={uploadProgram}>
			<label for="number">Calificaci&oacute;n n°</label>
			<Select bind:value={program.number} id={'number'}>
				<option value="">Seleccione una opci&oacute;n</option>
				{#each Array(30) as _, i}
					<option value={i + 1}>{i + 1}°</option>
				{/each}
			</Select>
			<label for="percentage">Porcentaje calificaci&oacute;n</label>
			<Input id={'percentage'} bind:value={program.percentage} type={'number'} />
			<label for="is_acumulative">Tipo de calificaci&oacute;n</label>
			<Select id={'is_acumulative'} bind:value={program.is_acumulative}>
				<option value="false">Calificaci&oacute;n directa</option>
				<option value="true">Acumulativa</option>
			</Select>
			{#if program.is_acumulative === 'true'}
				<h3>Calificaciones acumulativas</h3>
				{#each program.acumulative as acumulative, i}
					<div class="Inline">
						<span>{i + 1})</span>
						<Input
							placeholder={`Porcentaje calificación ${i + 1}°`}
							bind:value={acumulative.percentage}
						/>
						<ButtonIcon
							classItem={'fa-solid fa-circle-minus'}
							clickFunction={() => deleteAcumulative(i)}
						/>
					</div>
				{/each}
				<ButtonIcon
					classItem={'fa-solid fa-plus'}
					clickFunction={addAcumulative}
					title={'Agregar calificación acumulativa'}
				/>
			{/if}
			<Button type={'submit'}>Subir programaci&oacute;n</Button>
		</Form>
	</Modal>
{/if}

<style>
	header {
		border: 2px solid var(--color-main);
		padding: 8px;
		margin-bottom: 10px;
	}

	.Inline {
		display: flex;
		gap: 5px;
		align-items: center;
	}
</style>
