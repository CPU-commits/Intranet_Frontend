import type { User } from "$models/users/users.model"

export enum HistoryTypeChange {
    'add',
    'delete',
    'update',
    'dismiss',
    'reintegrate',
    'close',
}

export type History = {
    _id: string
    change: string
    collection_name: string
    who: User
    type_change: keyof typeof HistoryTypeChange
    why?: string
    semester: string
    date: string
}
