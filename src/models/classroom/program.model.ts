export type GradeProgramAcumulative = {
    _id: string
    number: number
    percentage: number
}

export type GradeProgram = {
    _id: string
    module: string
    number: number
    is_acumulative: boolean
    percentage: number
    acumulative: GradeProgramAcumulative[]
}
