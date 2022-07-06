import moment from 'moment-with-locales-es6'
import { arabToRoman } from 'roman-numbers'

export function formatDate(date: string | Date) {
    return moment(date).locale('es').utc().format('LLL')
}

export function timeAgo(date: string | Date) {
    return moment(date).locale('es').utc().fromNow()
}

export function isValidHttpUrl(string: string): boolean {
    let url: URL
    try {
        url = new URL(string)
    } catch (err) {
        return false
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
}

export function intToRoman(num: number) {
    return arabToRoman(num)
}
