import type { ToastType } from "./toastType.model"

export interface Toast {
    message: string
    type: keyof typeof ToastType
    dismissible?: boolean
    timeout?: number
}
