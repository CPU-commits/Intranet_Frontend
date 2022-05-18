export default function(url: string) {
    const link = document.createElement('a')
    document.body.appendChild(link)
    link.href = url
    link.click()
    document.body.removeChild(link)
}
