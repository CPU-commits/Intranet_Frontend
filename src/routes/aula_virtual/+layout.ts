import type { Session } from '$models/session.model'
import { UserTypes } from '$models/users/user_type.model'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
    const session: Session = await parent()
	if (
		session?.user?.user_type !== UserTypes.STUDENT_DIRECTIVE &&
		session?.user?.user_type !== UserTypes.STUDENT &&
		session?.user?.user_type !== UserTypes.TEACHER
	) {
		throw error(401, 'No estás autorizado para esta ruta')
	}
	return {}
}
