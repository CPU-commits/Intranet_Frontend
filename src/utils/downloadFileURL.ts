export default function(url: string, filename?: string) {
    const link = document.createElement('a')
    document.body.appendChild(link)
    if (filename) link.download = filename
    link.href = url
    link.click()
    document.body.removeChild(link)
}
