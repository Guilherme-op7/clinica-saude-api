import { tbespecialidades } from "@@/libs/sql/tbespecialidades"
import { Utils } from "@@/libs/utils"
import { cadastrarEspecialidadeModel } from "@@/models/api/cadastrar-especialidade"

export default async (router: Router.Router): Promise<Router.Router> => {
    router.get('/', async (req, res) => {
        const sql = req.extras

        const lista = await tbespecialidades.get(s => s, sql)

        if (lista.errorID !== undefined) {
            return res.status(500).error(lista)
        }
        return res.status(200).json(lista)
    })

    router.get('/:id', async (req, res) => {
        const sql = req.extras

        const especialidade = await tbespecialidades.ListarEspecialidadesId(+req.params.id, sql)

        if (especialidade.errorID !== undefined) {
            return res.status(404).error(especialidade)
        }

        return res.status(200).json(especialidade)
    })

    router.post('/', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, "ADMIN")

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarEspecialidadeModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1ESPCAD001',
                msg: 'Erro ao validar os dados da especialidade',
                error: validado.errors
            })
        }

        const criada = await tbespecialidades.CriarEspecialidades({
            PK_ID: 0, // so p satisfazer o tipo
            DS_ESPECIALIDADE: validado.value.DS_ESPECIALIDADE,
            VL_CONSULTA: validado.value.VL_CONSULTA,
            DS_COR: validado.value.DS_COR,
        }, usuario.mssql)

        if (criada.errorID !== undefined) {
            return res.status(500).error(criada)
        }

        return res.status(201).json(criada)
    })

    router.put('/:id', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, "ADMIN")

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarEspecialidadeModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1ESPUPD001',
                msg: 'Erro ao validar os dados da especialidade',
                error: validado.errors
            })
        }

        const atualizada = await tbespecialidades.AtualizarEspecialidades({
            PK_ID: +req.params.id,
            DS_ESPECIALIDADE: validado.value.DS_ESPECIALIDADE,
            VL_CONSULTA: validado.value.VL_CONSULTA,
            DS_COR: validado.value.DS_COR,
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

        const removida = await tbespecialidades.RemoverEspecialidades(+req.params.id, usuario.mssql)

        if (removida.errorID !== undefined) {
            return res.status(500).error(removida)
        }

        return res.status(200).json({})
    })

    return router
}
