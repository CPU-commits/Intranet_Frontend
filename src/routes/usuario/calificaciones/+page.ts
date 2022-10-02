import type { Session } from "$models/session.model"
import { UserTypes } from "$models/users/user_type.model"
import { error } from "@sveltejs/kit"

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
    const session: Session = await parent()
    const user_type = session.user.user_type
    if (user_type != UserTypes.STUDENT && user_type != UserTypes.STUDENT_DIRECTIVE)
        throw error(401, 'No estás autorizado a esta ruta')
	return {}
}
