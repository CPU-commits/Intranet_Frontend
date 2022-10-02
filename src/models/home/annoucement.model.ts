import type { UserFiles } from "$models/users/files.model"
import type { User } from "$models/users/users.model"

export type Annoucement = {
    _id: string
    files: Array<UserFiles>
    user: User
    annoucement: string
    upload_date: string
    update_date: string
}
