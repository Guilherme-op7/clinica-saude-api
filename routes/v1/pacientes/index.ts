import { Utils } from '@@/libs/utils'
import { TbPacientes } from '@@/libs/sql/tbpacientes'
import { cadastrarpacienteModel } from '@@/models/api/cadastrar-paciente'

export default async function (router: Router.Router): Promise<Router.Router> {
    router.get('/', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO', 'MEDICO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const { nome, status } = req.query

        const lista = await TbPacientes.ListarPacientesFiltro({
            nome: typeof nome === 'string' ? nome : undefined,
            status: status === 'ativo' || status === 'inativo' ? status : undefined,
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

        // Paciente só enxerga o próprio cadastro
        if (usuario.token.type === 'PACIENTE' && usuario.token.fkPaciente !== +req.params.id) {
            return res.status(403).error({
                errorID: 'BR1PACGET001',
                msg: 'Você não tem permissão para realizar esta ação'
            })
        }

        const paciente = await TbPacientes.getById(+req.params.id, usuario.mssql)

        if (paciente.errorID !== undefined) {
            return res.status(404).error(paciente)
        }

        return res.status(200).json(paciente)
    })

    router.post('/', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarpacienteModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1PACCAD001',
                msg: 'Erro ao validar os dados do paciente',
                error: validado.errors
            })
        }

        const criado = await TbPacientes.CadastrarPaciente(validado.value, usuario.mssql)

        if (criado.errorID !== undefined) {
            return res.status(400).error(criado)
        }

        return res.status(201).json(criado)
    })

    router.put('/:id', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarpacienteModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1PACUPD001',
                msg: 'Erro ao validar os dados do paciente',
                error: validado.errors
            })
        }

        const existente = await TbPacientes.getById(+req.params.id, usuario.mssql)

        if (existente.errorID !== undefined) {
            return res.status(404).error(existente)
        }

        const atualizado = await TbPacientes.AtualizarPaciente(existente.PK_ID, validado.value, usuario.mssql)

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

        const existente = await TbPacientes.getById(+req.params.id, usuario.mssql)

        if (existente.errorID !== undefined) {
            return res.status(404).error(existente)
        }

        const desativado = await TbPacientes.DesativarPaciente(existente.PK_ID, usuario.mssql)

        if (desativado.errorID !== undefined) {
            return res.status(500).error(desativado)
        }

        return res.status(200).json({})
    })

    return router
}
