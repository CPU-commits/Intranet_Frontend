import type Quill from 'quill'
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'

export function deltaToHtml(quill: Quill): string {
    const cfg = {}
    const converter = new QuillDeltaToHtmlConverter(quill.getContents().ops, cfg)
    return converter.convert()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deltaQuillToHtml(delta: any) {
    const cfg = {}
    const converter = new QuillDeltaToHtmlConverter(delta.ops, cfg)
    return converter.convert()
}
