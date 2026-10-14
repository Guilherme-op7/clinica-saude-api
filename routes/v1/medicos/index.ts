import { Utils } from '@@/libs/utils'
import { tbmedicos } from '@@/libs/sql/tbmedicos'
import { cadastrarmedicoModel } from '@@/models/api/cadastrar-medico'

export default async function (router: Router.Router): Promise<Router.Router> {
    router.get('/', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO', 'MEDICO', 'PACIENTE'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const { especialidade, ativo } = req.query

        const lista = await tbmedicos.ListarMedicosFiltro({
            especialidade: typeof especialidade === 'string' && Number.isInteger(+especialidade) ? +especialidade : undefined,
            ativo: ativo === 'true' ? true : ativo === 'false' ? false : undefined,
        }, usuario.mssql)

        if (lista.errorID !== undefined) {
            return res.status(500).error(lista)
        }

        return res.status(200).json(lista)
    })

    router.get('/:id', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO', 'MEDICO', 'PACIENTE'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const medico = await tbmedicos.getById(+req.params.id, usuario.mssql)

        if (medico.errorID !== undefined) {
            return res.status(404).error(medico)
        }

        return res.status(200).json(medico)
    })

    router.post('/', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, 'ADMIN')

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarmedicoModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1MEDICCAD001',
                msg: 'Erro ao validar os dados do médico',
                error: validado.errors
            })
        }

        const criado = await tbmedicos.CadastrarMedico(validado.value, usuario.mssql)

        if (criado.errorID !== undefined) {
            return res.status(400).error(criado)
        }

        return res.status(201).json(criado)
    })

    router.put('/:id', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, 'ADMIN')

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarmedicoModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1MEDICUPD001',
                msg: 'Erro ao validar os dados do médico',
                error: validado.errors
            })
        }

        const existente = await tbmedicos.getById(+req.params.id, usuario.mssql)

        if (existente.errorID !== undefined) {
            return res.status(404).error(existente)
        }

        const atualizado = await tbmedicos.AtualizarMedico(existente.PK_ID, validado.value, usuario.mssql)

        if (atualizado.errorID !== undefined) {
            return res.status(400).error(atualizado)
        }

        return res.status(200).json({})
    })

    router.delete('/:id', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, 'ADMIN')

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const existente = await tbmedicos.getById(+req.params.id, usuario.mssql)

        if (existente.errorID !== undefined) {
            return res.status(404).error(existente)
        }

        const desativado = await tbmedicos.DesativarMedico(existente.PK_ID, usuario.mssql)

        if (desativado.errorID !== undefined) {
            return res.status(500).error(desativado)
        }

        return res.status(200).json({})
    })

    return router
}
