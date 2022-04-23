export interface HTTPConfig {
    headers: {
        'content-type': string
        'access-token'?: string
    }
    data?
    responseType?
}
