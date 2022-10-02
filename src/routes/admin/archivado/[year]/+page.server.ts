import { variables } from '$lib/variables'
import type { Semester } from '$models/admin/semester.model'
import type { FetchResponse } from '$models/HTTP/fetchDataResponse.model'
import type { Session } from '$models/session.model'
import API from '$utils/APIModule'
import { error } from '@sveltejs/kit'

export async function load({ parent, params }) {
    try {
        const session: Session = await parent()
        const token = session.user.token
        const dataFetch = await API.fetchGetData(
            `${variables.API}/api/semesters/get_semester_year/${params.year}`,
            false,
            token,
        )
        const semesters: Array<Semester> = dataFetch.body.semesters
        // Get data from each semester
		const finishedSemesters = semesters.filter((semester) => {
			if (semester.status === 0) return semester
		})

		const promises = {
			first: {
				promises: [] as Array<Promise<FetchResponse>>,
                semester: null as Semester,
			},
			second: {
				promises: [] as Array<Promise<FetchResponse>>,
                semester: null as Semester,
			},
		}
		finishedSemesters.forEach((semester) => {
			if (semester.semester === 1) {
				promises.first.promises.push(
					API.fetchGetData(
						`${variables.API}/api/classroom/get_populated_modules_semester/${semester._id}`,
						true,
						token,
					),
				)
                promises.first.semester = semester
			} else {
				promises.second.promises.push(
					API.fetchGetData(
						`${variables.API}/api/classroom/get_populated_modules_semester/${semester._id}`,
						true,
						token,
					),
					API.fetchGetData(
						`${variables.API}/api/semesters/get_repeating_students/${semester._id}`,
						true,
						token,
					),
				)
                promises.second.semester = semester
			}
		})
		const dataFetchSemesters = await Promise.all([
			Promise.all(promises.first.promises),
			Promise.all(promises.second.promises),
		]).then((data) => {
			return {
				first:
					data[0].length > 0
						? {
							modules: data[0][0].body.modules,
                            semester: promises.first.semester,
						}
						: {
                            semester: promises.first.semester,
                        },
				second:
					data[1].length > 0
						? {
							modules: data[1][0].body.modules,
							students: data[1][1].body.students,
                            semester: promises.second.semester,
						}
						: {
                            semester: promises.second.semester,
                        },
			}
		})
        return {
            semesters: [
                dataFetchSemesters.first,
                dataFetchSemesters.second,
            ],
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
