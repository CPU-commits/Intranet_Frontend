import { writable } from "svelte/store"

export const notificationNumber = writable<number>(0)

export { notificationNumber as default }
