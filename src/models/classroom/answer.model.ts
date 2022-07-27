import type { EvaluateAnswer } from "./evaluate.model"

export type Answer = {
    answer: number
    date: string
    question: string
    response: string
}

export type AnswerWEvaluate = {
    answer: Answer
    evaluate: EvaluateAnswer
}
