export interface FetchResponse<T> {
    success: boolean
    message?: string
    statusCode?: number
    request?: Request
    body?: T
}
