import type { Subject } from "$models/admin/subjects.model"

enum NotificationTypes {
    'global',
    'classroom',
}

enum TypeClassroom {
    'publication',
    'work',
    'grade',
}

export type Notification = {
    title: string
    url: string
    img?: string
    subject?: Subject
    type_classroom: keyof typeof TypeClassroom
    type: keyof typeof NotificationTypes
}

export type NotificationType = {
    _id: string
    date: string | Date
    notification: Notification
}

export type NotificationsFetch = {
    total: boolean
    notifications: NotificationType[]
}
