import type { UserFiles } from "$models/users/files.model"

export type Author = {
    _id?: string
    name: string
    biography: string
    table_info: Array<{
        key: string
        value: string
    }>
    fun_facts: Array<{
        title: string
        fact: string
    }>
    references: Array<string>
    slug?: string
    image?: UserFiles
    date_upload?: string
    date_update?: string
}
