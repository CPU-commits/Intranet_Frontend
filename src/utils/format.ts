import moment from 'moment-with-locales-es6'
import { arabToRoman } from 'roman-numbers'

export function formatDate(date: string | Date) {
    return moment(date).locale('es').utc().format('LLL')
}

export function timeAgo(date: string | Date) {
    return moment(date).locale('es').utc().fromNow()
}

export function secondsToHoursFormat(seconds: number) {
    const hours = seconds / (60**2)
    let hoursFormat = `${Math.trunc(hours)}:`
    hoursFormat += `${hours % 1 * 60}`
    return hoursFormat
}

export function formatDateUTC(date: string | Date) {
    return moment(date).locale('es').utc()
}

export function intToChar(int: number) {
    const code = 'a'.charCodeAt(0)
    return String.fromCharCode(code + int)
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

export function formatGrade(grade: number) {
    const gradeArray = grade.toString().split('')
    const gradeString = `${gradeArray[0]}.${gradeArray[1]}`
    return gradeString
}

export function intToRoman(num: number) {
    return arabToRoman(num)
}
