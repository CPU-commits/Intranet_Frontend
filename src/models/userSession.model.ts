import type { UserType } from "./users/user_type.model"

export interface UserSession {
    user_type: keyof typeof UserType
    status: number
    name: string
}
