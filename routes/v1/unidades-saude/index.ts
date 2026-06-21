import { tbunidadessaude } from '@@/libs/sql/tbunidadessaude'
import { Utils } from '@@/libs/utils'
import { cadastrarunidadessaudeModel } from '@@/models/api/cadastrar-unidades-saude'

export default async (router: Router.Router): Promise<Router.Router> => {

    router.get('/', async (req, res) => {
        const sql = req.extras

        const consulta = await tbunidadessaude.get(s => s, sql)

        if (consulta.errorID !== undefined) {
            return res.status(500).error(consulta)
        }

        return res.status(200).json(consulta)
    })

    router.get('/:id', async (req, res) => {
        const sql = req.extras

        const unidades = await tbunidadessaude.getById(+req.params.id, sql)

        if (unidades.errorID !== undefined) {
            return res.status(500).error(unidades)
        }

        return res.status(200).json(unidades)
    })

    router.post('/', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, "ADMIN")

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarunidadessaudeModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1ESPCAD002',
                msg: 'Erro ao validar os dados da unidade de saude',
                error: validado.errors
            })
        }

        const criada = await tbunidadessaude.CriarUnidadeSaude({
            PK_ID: 0,
            DS_ENDERECO: validado.value.DS_ENDERECO,
            DS_TELEFONE: validado.value.DS_TELEFONE,
            DS_UNIDADE: validado.value.DS_UNIDADE
        }, usuario.mssql)

        if (criada.errorID !== undefined) {
            return res.status(500).error(criada)
        }

        return res.status(201).json(criada)
    })

    router.put("/:id", async (req, res) => {
        const usuario = Utils.getUsuario(req.user, "ADMIN")

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarunidadessaudeModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1ESPCAD003',
                msg: 'Erro ao validar os dados da unidade de saude',
                error: validado.errors
            })
        }

        const atualizada = await tbunidadessaude.AtualizarUnidadeSaude({
            PK_ID: +req.params.id,
            DS_ENDERECO: validado.value.DS_ENDERECO,
            DS_TELEFONE: validado.value.DS_TELEFONE,
            DS_UNIDADE: validado.value.DS_UNIDADE
        }, usuario.mssql)

        if (atualizada.errorID !== undefined) {
            return res.status(500).error(atualizada)
        }

        return res.status(200).json({})
    })

    router.delete('/:id', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, "ADMIN")

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const removida = await tbunidadessaude.RemoverUnidadeSaude(+req.params.id, usuario.mssql)

        if (removida.errorID !== undefined) {
            return res.status(500).error(removida)
        }

        return res.status(200).json({})
    })


    return router
}
