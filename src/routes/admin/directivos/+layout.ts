import { UserTypes } from '$models/users/user_type.model'
import { error } from '@sveltejs/kit'

export function load({ session }) {
	if (session?.user?.user_type !== UserTypes.DIRECTOR)
		throw error(401, 'No tienes acceso a esta ruta')
	return {}
}
