import { variables } from '$lib/variables'
import { createClient } from 'redis'

async function createClientRedis() {
    try {
        const { user, password, host, port } = variables.redis
        const client = createClient({
            url: `redis://${user}:${password}@${host}:${port}`
        })
        await client.connect()
        return client
    }catch(err){
        return err
    }
}

export default createClientRedis
