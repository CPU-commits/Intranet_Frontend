export default function (type: string) {
    if (type.includes('audio')) return 'fa-solid fa-file-audio'
    if (type.includes('video')) return 'fa-solid fa-file-video'
    if (type.includes('csv')) return 'fa-solid fa-file-csv'
    if (type.includes('image')) return 'fa-solid fa-file-image'
    if (type.includes('pdf')) return 'fa-solid fa-file-pdf'
    if (type.includes('powerpoint') || type.includes('presentation'))
        return 'fa-solid fa-file-powerpoint'
    if (type.includes('word')) return 'fa-solid fa-file-word'
    if (type.includes('octet-stream') || type.includes('rar') || type.includes('zip'))
        return 'fa-solid fa-file-zipper'
    if (
        type.includes('javascript') ||
        type.includes('python') ||
        type.includes('html') ||
        type.includes('css') ||
        type.includes('text/x-c')
    )
        return 'fa-solid fa-file-zipper'
    if (type.includes('text')) return 'fa-solid fa-file-lines'
    if (type.includes('excel') || type.includes('sheet')) return 'fa-solid fa-file-excel'
    return 'fa-solid fa-file'
}
