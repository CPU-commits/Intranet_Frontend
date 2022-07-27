import type { ItemTypeEnum, QuestionTypeEnum } from "./form.model"

export type ItemQuestionType = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    question: any
    type: keyof typeof QuestionTypeEnum
    answers: Array<string>
    points?: string
    correct?: number
    answer?: string
}

export type ItemType = {
    title: string
    points_type: keyof typeof ItemTypeEnum
    points?: string
    questions: Array<ItemQuestionType>
}
