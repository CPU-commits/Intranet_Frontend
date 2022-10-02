import { variables } from "$lib/variables";
import API from "$utils/APIModule";
import { json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function GET(event) {
    try {
        const module = event.url.searchParams.get('module')
        const token = event.request.headers.get('Authorization').replace('Bearer ', '')
        const dataFetch = await Promise.all([
            API.fetchGetData(
                `${variables.API_CLASSROOM_READ}/api/classroom/grades/get_students_grades/${module}`,
                true,
                token,
            ),
            API.fetchGetData(
                `${variables.API_CLASSROOM_READ}/api/classroom/grades/get_grade_programs/${module}`,
                true,
                token,
            ),
        ])
        return json({
            success: true,
            body: {
                grades: dataFetch[0].body.students,
			    gradePrograms: dataFetch[1].body.programs,
            },
        })
    } catch (err) {
        return json({
            success: false,
            message: err.message,
        }, { status: err.status })
    }
}
