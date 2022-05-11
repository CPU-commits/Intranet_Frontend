import type { User } from "$models/users/users.model"
import type { Section } from "./courses.model"

export interface Student extends User {
    course?: Section
}

export interface Students {
    users: Student[]
    total?: number
}
