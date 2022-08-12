import type { User } from "$models/users/users.model"

export type GradeSee = {
    _id?: string
    grade: number
    is_acumulative: boolean
    evaluator?: {
        name: string
        first_lastname: string
    }
    acumulative?: Array<{
        _id: string
        grade: number
        evaluator: {
            name: string
            first_lastname: string
        }
        date: string
    }>
    date?: string
}

export type StudentGrade = {
    student: User
    grades: Array<GradeSee>
}
