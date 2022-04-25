import axios, { type AxiosError } from "axios"

import { spinner } from "$stores/stores"

import type { HTTPConfig } from "$models/HTTP/config.model"
import type { HTTPMethods } from "$models/HTTP/methods.model"
import type { FetchResponse } from "$models/HTTP/fetchDataResponse.model"

export interface ErrorFetchResponse {
    success: boolean
    statusCode: number
    message: string
}

class APIModule {
    private handleUnexpectedError(error: Error){
        return {
            success: false,
            message: error.message,
            statusCode: 500,
        }
    }

    private async handleAxiosError(error: AxiosError){
        const responseJSON = error.response.data
        if(error.response){
            return {
                success: false,
                statusCode: error.response.status,
                message: responseJSON.message,
            }
        }else{
            return {
                success: false,
                message: responseJSON?.message
                    ? responseJSON?.message
                    : error.request.statusText,
                request: error.request,
                statusCode: 500,
            }
        }
    }

    async fetchData(
        method: keyof typeof HTTPMethods,
        URL: string,
        body = undefined,
        spinnerStatus = true,
        config: HTTPConfig = {
            headers: {
                'content-type': 'application/json',
            },
        },
        token?: string
    ): Promise<FetchResponse> {
        spinner.set(spinnerStatus)
        if(token)
            config.headers["access-token"] = token
        const response = await axios[method](URL, body, config)
            .then((res) =>{
                return res.data
            })
            .catch(async (error: Error | AxiosError) =>{
                if(axios.isAxiosError(error)){
                    return await this.handleAxiosError(error)
                }else{
                    return this.handleUnexpectedError(error)
                }
            })
        spinner.set(false)
        if(!response.success)
            throw response
        return response
    }

    async fetchGetData(
        URL: string,
        spinnerStatus = false,
        token?: string,
        config: HTTPConfig = {
            headers: {
                'content-type': 'application/json',
            },
        },
    ): Promise<FetchResponse> {
        spinner.set(spinnerStatus)
        if(token)
            config.headers["access-token"] = token
        const response = await axios.get(URL, config)
            .then((res) =>{
                return res.data
            })
            .catch(async (error: Error | AxiosError)=>{
                if(axios.isAxiosError(error)){
                    return await this.handleAxiosError(error)
                }else{
                    return this.handleUnexpectedError(error)
                }
            })
        spinner.set(false)
        if(!response.success && config.responseType !== 'arraybuffer')
            throw response
        return response
    }
}

const API = new APIModule()

export default API