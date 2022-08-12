export enum Indexs {
    'works',
    'publications',
}

export type Hits = {
    hits: Array<{
        _id: string
        _index: keyof typeof Indexs
        _score: number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _source: any
    }>
    max_score: number
    total: {
        relation: string
        value: number
    }
}
