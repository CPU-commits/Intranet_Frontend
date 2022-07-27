import type { User } from "$models/users/users.model"
import type { ItemQuestionType, ItemType } from "./item.model"

export enum QuestionTypeEnum {
    'alternatives',
    'alternatives_correct',
    'written',
    '',
}

export enum ItemTypeEnum {
    'equal',
    'custom',
    'without',
    '',
}

export type ItemQuestion = ItemQuestionType & { _id?: string, question: string }

export type FormItem = ItemType & { _id?: string }

export type UserForm = {
    _id: string
    title: string
    author: User | string
    items: Array<FormItem>
    has_points: boolean | string
    update_date: string | Date
    upload_date: string | Date
}

export type FormType = {
    title: string
    items: Array<ItemType>
    has_points: string | boolean
}
