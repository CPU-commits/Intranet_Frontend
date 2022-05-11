import type { User } from "$models/users/users.model";
import type { Section } from "./courses.model";
import type { Subject } from "./subjects.model";

export interface TeacherImparted {
    _id: string
    subject: Subject
    course: Section
}

export interface Teacher {
    _id: string
    user: User
    imparted: TeacherImparted[]
}

export interface Teachers {
    total?: number
    users: Teacher[]
}
