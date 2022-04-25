import type { User } from "$models/users/users.model"
import type { Cycle } from "./cycles.model"
import type { Subject } from "./subjects.model"

export interface Section {
    section: string
    subjects: Subject[]
    _id: string
}

export interface Course {
    _id: string
    course: string
    header_teacher: User
    level: number
    sections: Array<Section>
    cycle: Cycle
    isFinal: boolean | string
}
