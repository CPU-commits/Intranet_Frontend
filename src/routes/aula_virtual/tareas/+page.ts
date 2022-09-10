import { UserTypes } from "$models/users/user_type.model"
import { error } from "@sveltejs/kit"

export async function load({ parent }) {
    const session = await parent()
    const user_type = session.user.user_type
    if (user_type !== UserTypes.STUDENT && user_type !== UserTypes.STUDENT_DIRECTIVE)
        throw error(401, 'No tienes acceso a esta ruta')
    return {}
}
