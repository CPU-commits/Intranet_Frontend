import type { Specialty } from "./specialties.model"

export interface Subject {
    subject: string
    specialty?: Specialty
    _id: string
}
