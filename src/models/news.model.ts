import type { UserFiles } from "./users/files.model"
import type { User } from "./users/users.model"

export enum NewsType {
    'global',
    'student'
}

export type News = {
    author: User
    headline: string
    image: UserFiles
    body: string
    type: keyof typeof NewsType
    title: string
    upload_date: string
    update_date: string
    url: string
    like: boolean
    likes: number
    _id: string
}
