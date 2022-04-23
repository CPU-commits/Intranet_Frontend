import type { Toast } from "$models/toast.model"
import { writable } from "svelte/store"

let counter = 0
export const toasts = writable([])

export const dismissToast = (id: number) => {
    toasts.update((all) => all.filter((t) => t.id !== id))
}

export const addToast = (toast: Toast) => {
    counter += 1
    const id = counter
    const defaults = {
        id,
        type: 'info',
        dismissible: true,
        timeout: 4000,
    }
    const t = { ...defaults, ...toast }
    toasts.update((all) => [t, ...all])
    if (t.timeout) setTimeout(()=> dismissToast(id), t.timeout)
}
