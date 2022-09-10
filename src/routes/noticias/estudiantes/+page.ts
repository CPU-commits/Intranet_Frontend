import type { Session } from "$models/session.model"
import { UserTypes } from "$models/users/user_type.model"
import { error } from "@sveltejs/kit"

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
    const session: Session = await parent()
    const userType = session.user.user_type
    if (userType !== UserTypes.STUDENT && userType !== UserTypes.STUDENT_DIRECTIVE)
        throw error(401, 'No tienes acceso a esta ruta')
    return {}
}
