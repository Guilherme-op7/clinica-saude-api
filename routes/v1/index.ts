import { getJWT } from '@@/libs/jwt'
import { getMssql } from '@@/libs/mssql'

// Single-tenant: toda request usa a mesma conexão MSSQL (getMssql()), sem lookup de cliente.
export default async function (router: Router.Router): Promise<Router.Router> {
    const jwt = getJWT<TApi.Token>()

    router.use('/', async (req, res, next) => {
        const sql = getMssql()
        req.extras = sql

        // login/cadastro não exigem token
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
