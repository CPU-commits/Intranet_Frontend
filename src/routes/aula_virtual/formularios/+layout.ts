import type { Session } from '$models/session.model'
import { UserTypes } from '$models/users/user_type.model'
import { error } from '@sveltejs/kit'

export async function load({ parent }) {
    const session: Session = await parent()
	if (session.user.user_type !== UserTypes.TEACHER) {
		throw error(401, 'No estás autorizado a esta ruta')
	}
	return {}
}
