import { UserTypes } from "$models/users/user_type.model"
import { variables } from '$lib/variables'
import API from '$utils/APIModule'
import { error } from "@sveltejs/kit"

export async function load({ session, params }) {
    const user_type = session.user.user_type
    if (user_type !== UserTypes.STUDENT && user_type !== UserTypes.STUDENT_DIRECTIVE)
        throw error(401, 'No tienes acceso a esta ruta')
    try {
        const dataFetch = await API.fetchGetData(
            `${variables.API_CLASSROOM_READ}/api/classroom/works/get_form/${params.form}`,
            false,
            session.user.token,
        )
        return {
            form: dataFetch.body.form,
            answers: dataFetch.body.answers,
            work: dataFetch.body.work,
            points: dataFetch.body.points,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
