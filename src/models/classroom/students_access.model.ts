import type { User } from "$models/users/users.model"
import type { FormAccess } from "./form_access.model"
import type { FilesUploadedClassroom } from '../classroom/files_uploaded.model'

export type StudentAccess = {
    access: FormAccess
    files_uploaded: FilesUploadedClassroom
    user: User
    evaluate?: {
        percentage: number
        points_total: number
    }
}
