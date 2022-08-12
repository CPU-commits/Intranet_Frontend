import type { UserFiles } from "$models/users/files.model"

export type Editorial = {
    _id: string
    editorial: string
    slug: string
    image: UserFiles
    status: boolean
    date: string
}
