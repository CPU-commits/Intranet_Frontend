import type { UserType } from "./user_type.model"

export interface User {
    name: string
    first_lastname: string
    second_lastname: string
    rut: string
    status?: number
    email?: string
    _id?: string
    user_type?: keyof typeof UserType
}
