<script lang="ts">
	import type QuillType from 'quill'

	export let readOnly = false
	export let placeholder = ''
	export let body = ''
	export let value: QuillType = null
	export let focusDown: (...any: any) => void = null
	export let beforeMount: (...any: any) => void = null

	import { onMount } from 'svelte'

	let editor: HTMLElement

	var toolbarOptions = [
		['bold', 'italic', 'underline', 'strike'], // toggled buttons
		['blockquote', 'code-block'],

		[{ header: 1 }, { header: 2 }], // custom button values
		[{ list: 'ordered' }, { list: 'bullet' }],
		[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
		[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
		[{ direction: 'rtl' }], // text direction

		[{ header: [1, 2, 3, 4, 5, 6, false] }],

		[{ color: [] }, { background: [] }], // dropdown with defaults from theme
		[{ align: [] }],
		['link', 'image', 'video'],
	]

	onMount(async () => {
		const { default: Quill } = await import('quill')
		if (!readOnly) {
			value = new Quill(editor, {
				theme: 'snow',
				placeholder: placeholder,
				modules: {
					toolbar: toolbarOptions,
				},
			})
		} else {
			value = new Quill(editor, {
				theme: 'snow',
				modules: {
					toolbar: false,
				},
				readOnly: true,
			})
		}
		if (focusDown)
			value.root.addEventListener('focusout', () => {
				focusDown()
			})
		if (beforeMount) beforeMount()
	})
</script>

<div id="editor" bind:this={editor}>
	{@html body}
</div>

<style>
	@import 'https://cdn.quilljs.com/1.3.6/quill.snow.css';

	#editor {
		width: 100%;
	}
</style>
