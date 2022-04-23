export const variables = {
    API: import.meta.env.VITE_API.toString(),
    CLIENT: import.meta.env.VITE_CLIENT,
    NODE_ENV: import.meta.env.VITE_NODE_ENV,
    redis: {
        user: import.meta.env.VITE_REDIS_USER,
        password: import.meta.env.VITE_REDIS_PASSWORD,
        port: import.meta.env.VITE_REDIS_PORT,
        host: import.meta.env.VITE_REDIS_HOST,
    },
}
