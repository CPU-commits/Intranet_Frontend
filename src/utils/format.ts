import moment from 'moment-with-locales-es6'

export function formatDate(date: string) {
    return moment(date).locale('es').utc().format('LLL')
}
