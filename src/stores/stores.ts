import type { VotingStatus } from "$models/voting.model"
import { writable } from "svelte/store"

export const spinner = writable(false)
export const voting = writable<keyof typeof VotingStatus>('waiting')
