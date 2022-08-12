import type { User } from "$models/users/users.model"

export type ProgramAcumulative = {
    _id?: string
    number: number
    percentage: number
}

export type GradeProgram = {
    _id: string
    number: number
    module?: string
    percentage: number
    is_acumulative: boolean
    acumulative?: ProgramAcumulative[]
}

export type Grade = {
    date: string
    evaluator: User
    grade: number
    is_acumulative: boolean
}
