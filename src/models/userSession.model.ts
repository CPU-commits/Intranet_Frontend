import type { UserType } from "./users/user_type.model"

export interface UserSession {
    _id: string
    user_type: keyof typeof UserType
    status: number
    name: string
    token: string
}
