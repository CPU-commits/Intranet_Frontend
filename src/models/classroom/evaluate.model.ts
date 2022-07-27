import type { User } from "$models/users/users.model"

export type EvaluateAnswer = {
    _id: string
    question: string
    student: string
    work: string
    evaluator: string | User
    points: number
    date: Date
}
