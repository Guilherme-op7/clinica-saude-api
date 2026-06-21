import { getJWT } from '@@/libs/jwt'
import { getMssql } from '@@/libs/mssql'

export default async function (router: Router.Router): Promise<Router.Router> {
    const jwt = getJWT<TApi.Token>()

    router.use('/', async (req, res, next) => {
        const sql = getMssql()
        req.extras = sql

        if (/^\/auth\/?.*/.test(req.path)) {
            return next()
        }

        const token = req.headers['x-access-token']

        if (token === undefined) {
            return res.status(403).error({
                errorID: 'BR1IND001',
                msg: 'É necessário um token no header'
            })
        }

        const tokenValidado = jwt.read(Array.isArray(token) ? token[0] : token)

        if (tokenValidado.errorID !== undefined) {
            return res.status(401).error({
                errorID: 'BR1IND002',
                msg: 'Token inválido ou expirado'
            })
        }

        req.user = {
            token: tokenValidado,
            mssql: sql
        } satisfies TApi.InfoUsuario

        return next()
    })

    return router
}
