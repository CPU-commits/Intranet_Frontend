<script lang="ts">
	import ButtonIcon from '$components/HTML/ButtonIcon.svelte'
	import Input from '$components/HTML/Input.svelte'
	import Select from '$components/HTML/Select.svelte'
	import type { ItemType } from '$models/classroom/item.model'
	import { intToRoman } from '$utils/format'
	import type { Editor } from '@tiptap/core'

	export let item: ItemType
	export let number: number
	export let checked: number
	export let type: string | boolean
	export let destroy: (index: number) => void
	export let editor: Editor
	export let question: number

	function changeItem() {
		question = 0
		if (editor) editor.commands.setContent(item.questions[question].question)
	}
</script>

<article class="Item">
	<div class="Item__checked">
		<input on:change={changeItem} bind:group={checked} value={number} type="radio" />
	</div>
	<section class="Item__content">
		<header class="Item__header">
			<h4>{intToRoman(number + 1)}.</h4>
			<Input placeholder={'Titulo'} bind:value={item.title} id={'title'} />
		</header>
		{#if type === 'true'}
			<label for="score">Asignaci&oacute;n de puntaje</label>
			<Select id={'score'} bind:value={item.points_type}>
				<option value="">Seleccionar una distribuci&oacute;n</option>
				<option value="equal">Puntaje distribuido equitativamente</option>
				<option value="custom">Puntaje personalizado</option>
			</Select>
			{#if item.points_type === 'equal'}
				<div class="Equal">
					<Input
						type={'number'}
						id={'points'}
						placeholder={'Puntaje total a distribuir'}
						bind:value={item.points}
					/>
				</div>
			{/if}
		{/if}
	</section>
	<aside class="Item__destroy">
		<ButtonIcon clickFunction={destroy} classItem={'fa-solid fa-xmark'} />
	</aside>
</article>

<style>
	.Item {
		padding: 10px;
		border-bottom: 1px solid var(--color-light);
		display: flex;
		width: 100%;
		box-sizing: border-box;
		align-items: center;
		gap: 10px;
	}

	.Item__content {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.Item__header {
		display: flex;
		width: 100%;
		box-sizing: border-box;
		align-items: center;
	}

	h4 {
		font-family: 'Inconsolata', monospace;
	}

	.Equal {
		max-width: 300px;
		width: 100%;
		align-self: center;
	}

	.Item__destroy {
		margin-left: 20px;
	}
</style>
