export enum ItemTypeEnum {
    'equal',
    'custom',
    '',
}

export enum QuestionTypeEnum {
    '',
    'alternatives',
    'alternatives_correct',
    'written',
}

export type Alterative = {
    alternative: string
}

export type ItemQuestion = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    question: any
    type: keyof typeof QuestionTypeEnum
    alternatives: Array<Alterative>
    answers: Array<string>
    correct: number
    points: string
}

export type ItemType = {
    title: string
    type: keyof typeof ItemTypeEnum
    points?: string
    questions: Array<ItemQuestion>
}
