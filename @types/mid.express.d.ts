import 'express'

declare global {
    namespace Express {
        interface Request {
            extras: MssqlLib
            user: TApi.InfoUsuario
        }
    }
}
