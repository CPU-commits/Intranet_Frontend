import type { VotingStatus } from "$models/voting.model"
import { writable } from "svelte/store"

export const spinner = writable<boolean>(false)
export const voting = writable<keyof typeof VotingStatus>('waiting')
