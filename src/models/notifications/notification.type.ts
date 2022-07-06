export type NotifyGlobal = {
    title: string
    url: string
    img: string
}

export type NotificationType = {
    _id: string
    date: string | Date
    notification: NotifyGlobal
}

export type NotificationsFetch = {
    total: boolean
    notifications: NotificationType[]
}
