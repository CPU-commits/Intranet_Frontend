import type { User } from "$models/users/users.model"

export type Voting = {
    _id: string
    finish_date: string
    start_date: string
    period: number // Numbers of months
    semester: string
    lists: Array<{
        _id?: string
        list_name: string
        students: Array<{
            _id: User
            rol: string
        }>
    }>
}
