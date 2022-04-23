export interface FetchResponse {
    success: boolean
    message?: string
    statusCode?: number
    request?
    body?
}
