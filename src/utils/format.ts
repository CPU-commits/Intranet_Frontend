import moment from 'moment-with-locales-es6'
import { arabToRoman } from 'roman-numbers'

export function formatDate(date: string | Date) {
    return moment(date).locale('es').utc().format('LLL')
}

export function formatMiniDate(date: string | Date) {
    return moment(date).locale('es').utc().format('MM/DD HH:mm')
}

export function timeAgo(date: string | Date) {
    return moment(date).locale('es').utc().fromNow()
}

export function removeTime(date: string | Date) {
    return moment(date).locale('es').utc().startOf('day').format('YYYY-MM-DD')
}

export function getOnlyTime(date: string | Date) {
    return moment(date).locale('es').utc().format('HH:mm')
}

export function secondsToHoursFormat(seconds: number) {
    const hours = seconds / (3600)
    let hoursFormat = `${Math.trunc(hours)}:`
    if (hoursFormat.length === 2)
        hoursFormat = `0${hoursFormat}`
    hoursFormat += `${Number((hours % 1).toFixed(2)) * 60}`
    if (hoursFormat.length === 4){
        const lastDigit = hoursFormat[3]
        const string = hoursFormat
        hoursFormat = ''
        for (let i = 0; i < 3; i++)
            hoursFormat += string[i]
        hoursFormat += `0${lastDigit}`
    }
    return hoursFormat
}

export function urlify(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" class="Link" href="' + url + '">' + url + '</a>'
    })
}

export function formatDateUTC(date: string | Date) {
    return moment(date).utcOffset(0, true).locale('es').utc().format('YYYY-MM-DD HH:mm')
}

export function formateDateInput(date: string | Date) {
    return moment(date).utc().format('YYYY-MM-DD')
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
