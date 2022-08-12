export const variables = {
    API: import.meta.env.VITE_API.toString(),
    API_FILES: import.meta.env.VITE_API_FILES.toString(),
    API_NEWS: import.meta.env.VITE_API_NEWS.toString(),
    API_NOTIFICATIONS: import.meta.env.VITE_API_NOTIFICATIONS.toString(),
    API_CLASSROOM_READ: import.meta.env.VITE_API_CLASSROOM_READ.toString(),
    API_CLASSROOM_WRITE: import.meta.env.VITE_API_CLASSROOM_WRITE.toString(),
    API_LIBRARY: import.meta.env.VITE_API_LIBRARY.toString(),
    CLIENT: import.meta.env.VITE_CLIENT,
    NODE_ENV: import.meta.env.VITE_NODE_ENV,
    redis: {
        user: import.meta.env.VITE_REDIS_USER,
        password: import.meta.env.VITE_REDIS_PASSWORD,
        port: import.meta.env.VITE_REDIS_PORT,
        host: import.meta.env.VITE_REDIS_HOST,
    },
}
