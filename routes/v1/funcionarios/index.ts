import { Utils } from '@@/libs/utils'

export default async function (router: Router.Router): Promise<Router.Router> {
    // GET /v1/funcionarios — admin e recepção podem listar
    router.get('/', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const { mssql } = usuario
        // const lista = await TbFuncionarios.get(b => b, mssql)
        // ...
        return res.status(200).json([])
    })

    // POST /v1/funcionarios — só admin cria FUNCIONÁRIO
    router.post('/', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, 'ADMIN')

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const { mssql } = usuario
        // const dados = await cadastrarFuncionarioModel.validate(req.body)
        // ...
        return res.status(201).json({})
    })

    return router
}
