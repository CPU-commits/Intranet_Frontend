import type { Section } from "$models/admin/courses.model"
import type { Semester } from "$models/admin/semester.model"
import type { Subject } from "$models/admin/subjects.model"
import type { Work } from "./work.model"

export type SubSection = {
    _id: string
    name: string
}

export type ClassroomModules = {
    section: Section
    sub_sections: SubSection[]
    semester: Semester
    status: boolean
    subject: Subject
    works?: Work[]
    _id: string
}
