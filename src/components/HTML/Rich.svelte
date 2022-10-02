<script lang="ts">
	// Exports
	export let editor: Editor = null
	export let body: string = ''
	export let readOnly: boolean = false
	export let haveBackground: boolean = true
	export let placeholder: string = 'Escribe algo...'
	export let beforeMount: () => any = null
	export let focusDown: () => any = null

	// Svelte
	import { onMount, onDestroy } from 'svelte'
	// Tiptap
	import { Editor } from '@tiptap/core'
	import StarterKit from '@tiptap/starter-kit'
	import CharacterCount from '@tiptap/extension-character-count'
	import Image from '@tiptap/extension-image'
	import Link from '@tiptap/extension-link'
	import Placeholder from '@tiptap/extension-placeholder'
	import Subscript from '@tiptap/extension-subscript'
	import Superscript from '@tiptap/extension-superscript'
	import Table from '@tiptap/extension-table'
	import TableCell from '@tiptap/extension-table-cell'
	import TableHeader from '@tiptap/extension-table-header'
	import TableRow from '@tiptap/extension-table-row'
	import TaskItem from '@tiptap/extension-task-item'
	import TaskList from '@tiptap/extension-task-list'
	import TextAlign from '@tiptap/extension-text-align'
	import Underline from '@tiptap/extension-underline'
	import Youtube from '@tiptap/extension-youtube'
	import CodeBlockLowLight from '@tiptap/extension-code-block-lowlight'
	import TextStyle from '@tiptap/extension-text-style'
	import { Color } from '@tiptap/extension-color'
	// Modules
	import { lowlight } from 'lowlight'
	// Components
	import ButtonRichInput from './ButtonRichInput.svelte'
	import Modal from '$components/Modal.svelte'
	import Form from './Form.svelte'
	import Button from './Button.svelte'
	import Input from './Input.svelte'
	// Stores
	import { addToast } from '$stores/toasts'
	import { afterUpdate } from 'svelte'

	let element: HTMLElement
	let editorElement: HTMLElement

	onMount(async () => {
		if (!haveBackground) {
			editorElement.style.setProperty('--background', 'transparent')
			editorElement.style.setProperty('--box-shadow', 'none')
			editorElement.style.setProperty('--padding', '0')
		} else {
			editorElement.style.setProperty('--background', 'white')
			editorElement.style.setProperty('--padding', '15px')
		}
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					blockquote: {
						HTMLAttributes: {
							class: 'ProseMirrorBlockquote',
						},
					},
				}),
				CharacterCount,
				Image.configure({
					allowBase64: true,
				}),
				Link.configure({
					validate: (href) => /^https?:\/\//.test(href),
				}),
				Placeholder.configure({
					placeholder,
				}),
				Subscript,
				Superscript,
				Table.configure({
					HTMLAttributes: {
						class: 'ProseMirrorTable',
					},
				}),
				TableCell,
				TableHeader,
				TableRow,
				TaskItem,
				TaskList.configure({
					HTMLAttributes: {
						class: 'PromiseMirrorTaskList',
					},
				}),
				TextAlign.configure({
					types: ['heading', 'paragraph'],
				}),
				Underline,
				Youtube.configure({
					inline: true,
					nocookie: true,
				}),
				CodeBlockLowLight.configure({
					lowlight,
					HTMLAttributes: {
						class: 'PromiseMirrorCode',
					},
				}),
				TextStyle,
				Color,
			],
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor
			},
			editorProps: {
				handleDOMEvents: {
					focusout: () => {
						if (focusDown) focusDown()
					},
				},
				attributes: {
					class: !haveBackground && readOnly ? 'ProseMirrorNoBackground' : '',
				},
			},
			onCreate: () => {
				if (beforeMount) beforeMount()
				if (focusDown)
					editor.options.editorProps.handleDOMEvents.focusout = () => {
						focusDown()
					}
			},
			content: body,
			autofocus: true,
			editable: !readOnly,
		})
	})

	onDestroy(() => {
		if (editor) editor.destroy()
	})

	afterUpdate(() => {
		if (body !== '') editor.commands.setContent(body)
	})

	// Image
	// Image Modal
	let imageModal = false
	const toggleModalImage = () => (imageModal = !imageModal)
	// Form
	let src: string
	let fileInput: HTMLInputElement

	function blobToBase64(blob: Blob) {
		return new Promise((resolve, _) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result)
			reader.readAsDataURL(blob)
		})
	}

	async function addImage() {
		try {
			if (fileInput.files.length === 1) {
				const file = fileInput.files[0]
				if (!file.type.includes('image')) throw new Error('Debe seleccionar una imagen')
				const base64 = await blobToBase64(file)
				editor
					.chain()
					.focus()
					.setImage({
						src: base64 as string,
					})
					.run()
			}
		} catch (err) {
			addToast({
				message: err.message,
				type: 'error',
			})
		}
	}

	function addUrlImage() {
		editor
			.chain()
			.focus()
			.setImage({
				src,
			})
			.run()
		imageModal = false
	}

	// Link
	// Link modal
	let linkModal = false
	const toggleModalLink = () => (linkModal = !linkModal)
	// Form
	let href: string

	function setLink() {
		// cancelled
		if (href === null) {
			return
		}

		// empty
		if (href === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()

			return
		}

		// update link
		editor.chain().focus().extendMarkRange('link').setLink({ href, target: '_blank' }).run()

		linkModal = false
	}
	// Youtube
	// YoutubeModal
	let youtubeModal = false
	const toggleModalYoutube = () => (youtubeModal = !youtubeModal)
	// Form
	let srcYoutube: string

	function setYoutube() {
		editor.commands.setYoutubeVideo({
			src: srcYoutube,
		})
	}

	function getValue(e) {
		return e.target.value
	}
</script>

<section class="Editor" bind:this={editorElement}>
	{#if !readOnly}
		<header class="Editor__header">
			{#if editor}
				<!-- Heading -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					selected={editor.isActive('heading', { level: 1 })}
					title={'Titulo 1'}
				>
					<i class="fa-solid fa-heading" />
					<span class="HNumber">1</span>
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					selected={editor.isActive('heading', { level: 2 })}
					title={'Titulo 2'}
				>
					<i class="fa-solid fa-heading" />
					<span class="HNumber">2</span>
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					selected={editor.isActive('heading', { level: 3 })}
					title={'Titulo 3'}
				>
					<i class="fa-solid fa-heading" />
					<span class="HNumber">3</span>
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
					selected={editor.isActive('heading', { level: 4 })}
					title={'Titulo 4'}
				>
					<i class="fa-solid fa-heading" />
					<span class="HNumber">4</span>
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
					selected={editor.isActive('heading', { level: 5 })}
					title={'Titulo 5'}
				>
					<i class="fa-solid fa-heading" />
					<span class="HNumber">5</span>
				</ButtonRichInput>
				<!-- Paragraph -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().setParagraph().run()}
					selected={editor.isActive('paragraph')}
					title={'Parrafo'}
				>
					<i class="fa-solid fa-p" />
				</ButtonRichInput>
				|
				<!-- Color -->
				<ButtonRichInput clickFunction={() => {}} title={'Color texto'}>
					<i class="fa-solid fa-paint-roller" />
				</ButtonRichInput>
				<input
					type="color"
					on:input={(event) => editor.chain().focus().setColor(getValue(event)).run()}
					value={editor.getAttributes('textStyle').color}
				/>
				|
				<!-- Bold -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleBold().run()}
					selected={editor.isActive('bold')}
					title={'Negrita'}
				>
					<i class="fa-solid fa-bold" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleItalic().run()}
					selected={editor.isActive('italic')}
					title={'Italica'}
				>
					<i class="fa-solid fa-italic" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleStrike().run()}
					selected={editor.isActive('strikethrough')}
					title={'Tachado'}
				>
					<i class="fa-solid fa-strikethrough" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleUnderline().run()}
					selected={editor.isActive('underline')}
					title={'Subrayado'}
				>
					<i class="fa-solid fa-underline" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleSubscript().run()}
					selected={editor.isActive('subscript')}
					title={'Subíndice'}
				>
					<i class="fa-solid fa-subscript" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleSuperscript().run()}
					selected={editor.isActive('superscript')}
					title={'Superíndice'}
				>
					<i class="fa-solid fa-superscript" />
				</ButtonRichInput>
				|
				<!-- Blockquote -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleBlockquote().run()}
					selected={editor.isActive('blockquote')}
					title={'Cita'}
				>
					<i class="fa-solid fa-quote-left" />
				</ButtonRichInput>
				|
				<!-- Align -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().setTextAlign('left').run()}
					selected={editor.isActive({ textAlign: 'left' })}
					title={'Izquierda'}
				>
					<i class="fa-solid fa-align-left" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().setTextAlign('center').run()}
					selected={editor.isActive({ textAlign: 'center' })}
					title={'Derecha'}
				>
					<i class="fa-solid fa-align-center" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().setTextAlign('right').run()}
					selected={editor.isActive({ textAlign: 'right' })}
					title={'Centrado'}
				>
					<i class="fa-solid fa-align-right" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().setTextAlign('justify').run()}
					selected={editor.isActive({ textAlign: 'justify' })}
					title={'Justificado'}
				>
					<i class="fa-solid fa-align-justify" />
				</ButtonRichInput>
				|
				<!-- Lists -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleBulletList().run()}
					selected={editor.isActive('bulletList')}
					title={'Lista desordenada'}
				>
					<i class="fa-solid fa-list" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleOrderedList().run()}
					selected={editor.isActive('orderedList')}
					title={'Lista ordenada'}
				>
					<i class="fa-solid fa-list-ol" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleTaskList().run()}
					selected={editor.isActive('taskList')}
					title={'Lista de tareas'}
				>
					<i class="fa-solid fa-list-check" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().sinkListItem('listItem').run()}
					disabled={!editor.can().sinkListItem('listItem')}
					title={'Adentrar lista'}
				>
					<i class="fa-solid fa-angles-right" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().liftListItem('listItem').run()}
					disabled={!editor.can().liftListItem('listItem')}
					title={'Retroceder lista'}
				>
					<i class="fa-solid fa-angles-left" />
				</ButtonRichInput>
				|
				<!-- Table -->
				<ButtonRichInput
					clickFunction={() =>
						editor
							.chain()
							.focus()
							.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
							.run()}
					title={'Crear tabla'}
				>
					<i class="fa-solid fa-table" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().addColumnBefore().run()}
					title={'Añadir columna a la izquierda'}
				>
					<i class="fa-solid fa-diagram-successor" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().addColumnAfter().run()}
					title={'Añadir columna a la derecha'}
				>
					<i class="fa-solid fa-diagram-predecessor" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().addRowAfter().run()}
					title={'Añadir fila'}
				>
					<i class="fa-solid fa-diagram-next" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().deleteColumn().run()}
					title={'Eliminar columna'}
				>
					<i class="fa-solid fa-minus" />
					<i class="fa-solid fa-table-columns" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().deleteRow().run()}
					title={'Eliminar fila'}
				>
					<i class="fa-solid fa-minus" />
					<i class="fa-solid fa-table-cells-large" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().deleteTable().run()}
					title={'Eliminar tabla'}
				>
					<i class="fa-solid fa-minus" />
					<i class="fa-solid fa-table" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeaderColumn().run()}
					title={'Encabezar columna'}
				>
					<i class="fa-solid fa-heading" />
					<i class="fa-solid fa-table-columns" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeaderRow().run()}
					title={'Encabezar fila'}
				>
					<i class="fa-solid fa-heading" />
					<i class="fa-solid fa-table-cells-large" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleHeaderCell().run()}
					title={'Encabezar celda'}
				>
					<i class="fa-solid fa-heading" />
					<i class="fa-solid fa-square" />
				</ButtonRichInput>
				|
				<!-- Code -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().toggleCodeBlock().run()}
					selected={editor.isActive('codeBlock')}
				>
					<i class="fa-solid fa-code" />
				</ButtonRichInput>
				<!-- Image -->
				<ButtonRichInput clickFunction={() => fileInput.click()} title={'Añadir imagen'}>
					<i class="fa-solid fa-file-image" />
				</ButtonRichInput>
				<input
					type="file"
					accept="image/png, image/gif, image/jpeg"
					bind:this={fileInput}
					on:change={addImage}
				/>
				<ButtonRichInput clickFunction={toggleModalImage} title={'Añadir imagen desde URL'}>
					<i class="fa-solid fa-image" />
				</ButtonRichInput>
				<!-- Link -->
				<ButtonRichInput clickFunction={toggleModalLink} title={'Añadir enlace'}>
					<i class="fa-solid fa-link" />
				</ButtonRichInput>
				<!-- Youtube -->
				<ButtonRichInput
					clickFunction={toggleModalYoutube}
					title={'Añadir video de Youtube'}
				>
					<i class="fa-brands fa-youtube" />
				</ButtonRichInput>
				|
				<!-- Salt -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().setHardBreak().run()}
					title={'Salto de linea'}
				>
					<i class="fa-solid fa-window-minimize" />
				</ButtonRichInput>
				<!-- Rule -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().setHorizontalRule().run()}
					title={'Linea horizontal'}
				>
					<i class="fa-solid fa-ruler-horizontal" />
				</ButtonRichInput>
				|
				<!-- History -->
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
					title={'Retroceder'}
				>
					<i class="fa-solid fa-rotate-left" />
				</ButtonRichInput>
				<ButtonRichInput
					clickFunction={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
					title={'Avanzar'}
				>
					<i class="fa-solid fa-rotate-right" />
				</ButtonRichInput>
				|
			{/if}
		</header>
	{/if}
	<div bind:this={element} />
	{#if editor && !readOnly}
		<footer class="Editor__footer">
			<small>{editor.storage.characterCount.characters()} C&aacute;racteres</small>
			<small>{editor.storage.characterCount.words()} Palabras</small>
		</footer>
	{/if}
</section>

{#if imageModal}
	<Modal onClose={toggleModalImage}>
		<h2 slot="title">Agregar imagen desde URL</h2>
		<Form form={addUrlImage}>
			<label for="image">Imagen</label>
			<Input bind:value={src} id={'image'} />
			<Button type={'submit'}>Agregar</Button>
		</Form>
	</Modal>
{/if}

{#if linkModal}
	<Modal onClose={toggleModalLink}>
		<h2 slot="title">Agregar enlace</h2>
		<Form form={setLink}>
			<label for="link">Enlace</label>
			<Input bind:value={href} id={'link'} />
			<Button type={'submit'}>Agregar</Button>
		</Form>
	</Modal>
{/if}

{#if youtubeModal}
	<Modal onClose={toggleModalYoutube}>
		<h2 slot="title">Agregar Youtube Video</h2>
		<Form form={setYoutube}>
			<label for="youtube">Enlace</label>
			<Input bind:value={srcYoutube} id={'youtube'} />
			<Button type={'submit'}>Agregar</Button>
		</Form>
	</Modal>
{/if}

<style>
	.Editor {
		width: 100%;
		box-sizing: border-box;
		background-color: var(--background);
		border-radius: 15px;
		padding: var(--padding);
		box-shadow: var(--box-shadow);
	}

	.Editor__header {
		padding: 10px;
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		border-bottom: 2px solid var(--color-main);
		color: var(--color-light);
	}

	.HNumber {
		font-size: 0.9rem;
		font-weight: bold;
		transition: all 0.4s ease;
	}

	input[type='file'] {
		display: none;
	}

	input[type='color'] {
		width: 20px;
		height: 20px;
		background-color: transparent;
		border: none;
	}

	.Editor__footer {
		margin-top: 10px;
	}
</style>
