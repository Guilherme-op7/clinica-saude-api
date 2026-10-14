import { Utils } from '@@/libs/utils'
import { tbmedicacoes } from '@@/libs/sql/tbmedicacoes'
import { cadastrarmedicacaoModel } from '@@/models/api/cadastrar-medicacao'

export default async function (router: Router.Router): Promise<Router.Router> {
    router.get('/', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO', 'MEDICO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const { nome, controlada, ativo } = req.query

        const lista = await tbmedicacoes.ListarMedicacoesFiltro({
            nome: typeof nome === 'string' ? nome : undefined,
            controlada: controlada === 'true' ? true : controlada === 'false' ? false : undefined,
            ativo: ativo === 'true' ? true : ativo === 'false' ? false : undefined,
        }, usuario.mssql)

        if (lista.errorID !== undefined) {
            return res.status(500).error(lista)
        }

        return res.status(200).json(lista)
    })

    router.get('/:id', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO', 'MEDICO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const medicacao = await tbmedicacoes.getById(+req.params.id, usuario.mssql)

        if (medicacao.errorID !== undefined) {
            return res.status(404).error(medicacao)
        }

        return res.status(200).json(medicacao)
    })

    router.post('/', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, 'ADMIN')

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarmedicacaoModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1MEDCAD001',
                msg: 'Erro ao validar os dados da medicação',
                error: validado.errors
            })
        }

        const criado = await tbmedicacoes.CadastrarMedicacao({
            ...validado.value,
            FL_CONTROLADA: validado.value.FL_CONTROLADA ?? false,
        }, usuario.mssql)

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

        const validado = await cadastrarmedicacaoModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1MEDUPD001',
                msg: 'Erro ao validar os dados da medicação',
                error: validado.errors
            })
        }

        const existente = await tbmedicacoes.getById(+req.params.id, usuario.mssql)

        if (existente.errorID !== undefined) {
            return res.status(404).error(existente)
        }

        const atualizado = await tbmedicacoes.AtualizarMedicacao(existente.PK_ID, {
            ...validado.value,
            FL_CONTROLADA: validado.value.FL_CONTROLADA ?? false,
        }, usuario.mssql)

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

        const existente = await tbmedicacoes.getById(+req.params.id, usuario.mssql)

        if (existente.errorID !== undefined) {
            return res.status(404).error(existente)
        }

        const desativado = await tbmedicacoes.DesativarMedicacao(existente.PK_ID, usuario.mssql)

        if (desativado.errorID !== undefined) {
            return res.status(500).error(desativado)
        }

        return res.status(200).json({})
    })

    return router
}
