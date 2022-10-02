export default async function(total: number, fx: (n: number) => Promise<number>, max = 30, element?: HTMLElement) {
    // Init
    let count = max
    let running = false
    // Body
    let elementScroll: HTMLElement
    if (element){
        elementScroll = element
    }else{
        elementScroll = document.body
    }
    if(total > max) {
        elementScroll.onscroll = async () => {
            let myPosition: number
            if (elementScroll !== document.body) {
                myPosition = elementScroll.scrollTop + elementScroll.clientHeight
            }else{
                myPosition = elementScroll.clientHeight - (elementScroll.getBoundingClientRect().bottom - window.innerHeight)
            }
            if(myPosition / elementScroll.scrollHeight >= 0.6 && !running && count < total){
                running = true
                count = await fx(count)
                running = false
            }
        }
    }
}
