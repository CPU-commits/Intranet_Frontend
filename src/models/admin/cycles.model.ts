import type { User } from "$models/users/users.model"

export interface Cycle {
    _id?: string
    cycle: string
    members?: User[]
}
