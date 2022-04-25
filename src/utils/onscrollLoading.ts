type ToDo = {
    (n: number): Promise<number>,
}

export default async function(total: number, f: ToDo, max = 30) {
    // Init
    let count = max
    let running = false
    // Body
    const body = document.body
    if(total > max) {
        body.onscroll = async () =>{
            const myPosition = window.scrollY + window.innerHeight
            if(myPosition / body.clientHeight >= 0.5 && !running && count < total){
                running = true
                count = await f(count)
                running = false
            }
        }
    }
}
