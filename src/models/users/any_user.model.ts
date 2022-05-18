import type { Section } from "$models/admin/courses.model";
import type { TeacherImparted } from "$models/admin/teacher.model";
import type { User } from "./users.model";

export interface AnyUser extends User {
    course?: Section
    registration_number?: string
    imparted?: TeacherImparted[]
}
