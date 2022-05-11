import type { User } from "$models/users/users.model"
import type { Cycle } from "./cycles.model"
import type { Subject } from "./subjects.model"

export interface Section {
    section: string
    course: Course
    header_teacher: User | string
    _id: string
}

export interface Course {
    _id: string
    course: string
    level: number
    sections: Array<Section>
    cycle: Cycle
    subjects: Subject[]
    isFinal: boolean | string
}
