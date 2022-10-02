import { variables } from '$lib/variables'
import type { Session } from '$models/session.model'
import API from '$utils/APIModule'
import { error } from '@sveltejs/kit'

export async function load({ parent, params, url }) {
    try {
        const session: Session = await parent()
        const dataFetch = await API.fetchGetData(
            `${variables.API_CLASSROOM_READ}/api/classroom/modules/get_module/${params.module}`,
            false,
            session.user.token,
        )
        const panel = {
            isPanel:
                !url.pathname.includes('trabajos') &&
                !url.pathname.includes('calificaciones') &&
                !url.pathname.includes('buscar'),
            section: url.searchParams.get('section') ? url.searchParams.get('section') : 0,
        }
        return {
            moduleData: dataFetch.body.module,
            panel,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
