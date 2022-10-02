import { variables } from "$lib/variables";
import type { FetchResponse } from "$models/HTTP/fetchDataResponse.model";
import type { Session } from "$models/session.model";
import API from "$utils/APIModule";
import { error } from "@sveltejs/kit";

type FinishSemester = {
    close_date_semester: Date | null
    semester_status: {
        value: 'ending' | 'working'
    }
}

export async function load({ parent }) {
    try {
        const session: Session = await parent()
        const dataFetch: FetchResponse<{ finish_semester: FinishSemester }> =
			await API.fetchGetData(
				`${variables.API}/api/semesters/get_finish_semester`,
				false,
				session.user.token,
			)
        return {
            finish_semester: dataFetch.body.finish_semester,
        }
    } catch (err) {
        throw error(err.statusCode, err.message)
    }
}
