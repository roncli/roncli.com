import session from "express-session"

declare module "express-session" {
    export interface SessionData {
        captcha: {
            text: string
            expires: Date
        }
        allowPasswordChange: string
        allowEmailChange: string
    }
}
