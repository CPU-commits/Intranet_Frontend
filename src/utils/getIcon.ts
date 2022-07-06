export function getIcon(type: string) {
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
        return 'fa-solid fa-file-code'
    if (type.includes('text')) return 'fa-solid fa-file-lines'
    if (type.includes('excel') || type.includes('sheet')) return 'fa-solid fa-file-excel'
    return 'fa-solid fa-file'
}

export function getTypeFile (type: string) {
    if (type.includes('audio')) return 'Audio'
    if (type.includes('video')) return 'Video'
    if (type.includes('csv')) return 'CSV'
    if (type.includes('image')) return 'Imagen'
    if (type.includes('pdf')) return 'PDF'
    if (type.includes('powerpoint') || type.includes('presentation'))
        return 'Powerpoint'
    if (type.includes('word')) return 'Word'
    if (
        type.includes('javascript') ||
        type.includes('python') ||
        type.includes('html') ||
        type.includes('css') ||
        type.includes('text/x-c')
    )
        return 'Archivo de código </>'
    if (type.includes('octet-stream') || type.includes('rar') || type.includes('zip'))
        return 'Archivo ZIP | RAR'
    if (type.includes('text')) return 'Texto'
    if (type.includes('excel') || type.includes('sheet')) return 'fa-solid fa-file-excel'
    return 'Excel'
}
