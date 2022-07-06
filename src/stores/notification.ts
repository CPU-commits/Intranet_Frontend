import { browser } from "$app/env"
import { writable } from "svelte/store"

const defaultValue = 0
const initialValue = browser
    ? JSON.parse(window.localStorage.getItem('notification'))
    ?? defaultValue
    : defaultValue

export const notificationNumber = writable<number>(initialValue)

notificationNumber.subscribe((value: number) => {
    if(browser) {
        window.localStorage.setItem('notification', value.toString())
    }
})

export { notificationNumber as default }
