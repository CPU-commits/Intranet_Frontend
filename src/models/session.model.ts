import type { UserSession } from "./userSession.model"

export type Session = {
    authenticated: boolean
    user: UserSession
}
