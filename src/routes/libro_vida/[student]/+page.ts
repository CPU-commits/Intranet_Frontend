import type { Session } from '$models/session.model'
import { UserTypes } from '$models/users/user_type.model'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
    try {
        const session: Session = await parent()
        const userType = session.user.user_type
        if (
            userType !== UserTypes.TEACHER &&
            userType !== UserTypes.DIRECTIVE &&
            userType !== UserTypes.DIRECTOR
        )
            throw error(401, 'No estás autorizado a esta ruta')
        return {}
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
