import { variables } from "$lib/variables"
import type { Session } from "$models/session.model"
import { UserTypes } from "$models/users/user_type.model"
import API from "$utils/APIModule"
import { error } from "@sveltejs/kit"

export async function load({ parent, params }) {
    const session: Session = await parent()
    if (session.user.user_type !== UserTypes.TEACHER)
        throw error(401, 'No tienes acceso a esta ruta')
    try {
        const dataFetch = await API.fetchGetData(
            `${variables.API_CLASSROOM_READ}/api/classroom/works/get_form_student/${params.form}/${params.student}`,
            false,
            session.user.token,
        )
        return {
            answers: dataFetch.body.answers ? dataFetch.body.answers : [],
            form: dataFetch.body.form,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
