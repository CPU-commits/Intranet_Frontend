import { env } from '$env/dynamic/private'
import { createClient } from 'redis'

async function createClientRedis() {
    try {
        const user = env.REDIS_USER
        const password = env.REDIS_PASSWORD
        const host = env.REDIS_HOST
        const port = env.REDIS_PORT
        const client = createClient({
            url: `redis://${user}:${password}@${host}:${port}`
        })
        await client.connect()
        return client
    } catch(err) {
        return err
    }
}

export default createClientRedis
