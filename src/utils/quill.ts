import Quill from 'quill'
import type Delta from 'quill-delta'
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'

export function deltaToHtml(quill: Quill): string {
    const cfg = {}
    const converter = new QuillDeltaToHtmlConverter(quill.getContents().ops, cfg)
    return converter.convert()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deltaQuillToHtml(delta: Delta) {
    const cfg = {}
    const converter = new QuillDeltaToHtmlConverter(delta.ops, cfg)
    return converter.convert()
}

export function htmlToDelta(html: string, document?: Document) {
    const div = document.createElement('div')
    div.setAttribute('id', 'htmlToDelta')
    div.innerHTML = `<div id="quillEditor" style="display:none">${html}</div>`
    document.body.appendChild(div)
    const quill = new Quill('#quillEditor', {
        theme: 'snow',
    })
    const delta = quill.getContents()
    document.getElementById('htmlToDelta').remove()
    return delta
}
