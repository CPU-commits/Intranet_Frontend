import type { User } from "$models/users/users.model"

export interface Directives {
    total?: number
    users: User[]
}
