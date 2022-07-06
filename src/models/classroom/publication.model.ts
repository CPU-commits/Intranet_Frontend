import type { UserFiles } from "$models/users/files.model"

export enum AttachedType {
    'link',
    'file',
}

export type ContentPublication = {
    author: string
    content: string
    published?: string
}

export type Attached = {
    file?: UserFiles
    link?: string
    title?: string
    _id: string
    type: keyof typeof AttachedType
}

export type Publication = {
    _id: string
    content: ContentPublication
    attached: Array<Attached>
    update_date: string | Date
    upload_date: string | Date
}
