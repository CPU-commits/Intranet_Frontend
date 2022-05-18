import type { OID } from "$models/oid.model"

export interface UserFiles {
    _id: OID
    filename: string
    key: string
    title: string
    type: string
    url: string
    permissions: number
    date: string
}
