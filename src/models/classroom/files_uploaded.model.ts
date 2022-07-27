import type { UserFiles } from '../users/files.model'

export type EvaluateFiles = {
    _id: string
    pattern: string
    points: number
}

export type FilesUploadedClassroom = {
    date: string
    files_uploaded: Array<UserFiles>
    evaluate?: Array<EvaluateFiles>
    student: string
    work: string
    _id: string
}
