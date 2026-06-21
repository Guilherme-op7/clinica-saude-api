import { Utils } from '@@/libs/utils'
import { tbfuncionarios } from '@@/libs/sql/tbfuncionarios'
import { cadastrarfuncionarioModel } from '@@/models/api/cadastrar-funcionario'

export default async function (router: Router.Router): Promise<Router.Router> {
    router.get('/', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const { departamento, cargo, ativo } = req.query

        const lista = await tbfuncionarios.ListarFuncionariosFiltro({
            departamento: typeof departamento === 'string' ? departamento : undefined,
            cargo: typeof cargo === 'string' ? cargo : undefined,
            ativo: ativo === 'true' ? true : ativo === 'false' ? false : undefined,
        }, usuario.mssql)

        if (lista.errorID !== undefined) {
            return res.status(500).error(lista)
        }

        return res.status(200).json(lista)
    })

    router.get('/:id', async (req, res) => {
        const usuario = Utils.getUsuarioOneOf(req.user, ['ADMIN', 'RECEPCAO'])

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const funcionario = await tbfuncionarios.getById(+req.params.id, usuario.mssql)

        if (funcionario.errorID !== undefined) {
            return res.status(404).error(funcionario)
        }

        return res.status(200).json(funcionario)
    })

    router.post('/', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, 'ADMIN')

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const validado = await cadastrarfuncionarioModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1FUNCCAD001',
                msg: 'Erro ao validar os dados do funcionário',
                error: validado.errors
            })
        }

        const criado = await tbfuncionarios.CadastrarFuncionario({
            PK_ID: 0,
            DS_NOME: validado.value.DS_NOME,
            DS_EMAIL: validado.value.DS_EMAIL,
            DS_TELEFONE: validado.value.DS_TELEFONE,
            DS_CARGO: validado.value.DS_CARGO,
            DS_DEPARTAMENTO: validado.value.DS_DEPARTAMENTO,
            NR_CPF: validado.value.NR_CPF,
            VL_SALARIO: validado.value.VL_SALARIO,
            DT_ADMISSAO: new Date(validado.value.DT_ADMISSAO),
            FL_ATIVO: true,
            DT_DEMISSAO: null,
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

        const validado = await cadastrarfuncionarioModel.validate(req.body)

        if (validado.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1FUNCUPD001',
                msg: 'Erro ao validar os dados do funcionário',
                error: validado.errors
            })
        }

        const atualizado = await tbfuncionarios.AtualizarFuncionario({
            PK_ID: +req.params.id,
            DS_NOME: validado.value.DS_NOME,
            DS_EMAIL: validado.value.DS_EMAIL,
            DS_TELEFONE: validado.value.DS_TELEFONE,
            DS_CARGO: validado.value.DS_CARGO,
            DS_DEPARTAMENTO: validado.value.DS_DEPARTAMENTO,
            NR_CPF: validado.value.NR_CPF,
            VL_SALARIO: validado.value.VL_SALARIO,
            DT_ADMISSAO: new Date(validado.value.DT_ADMISSAO),
            FL_ATIVO: true,
            DT_DEMISSAO: null,
        }, usuario.mssql)

        if (atualizado.errorID !== undefined) {
            return res.status(500).error(atualizado)
        }

        return res.status(200).json({})
    })

    router.delete('/:id', async (req, res) => {
        const usuario = Utils.getUsuario(req.user, 'ADMIN')

        if (usuario.errorID !== undefined) {
            return res.status(403).error(usuario)
        }

        const desativado = await tbfuncionarios.DesativarFuncionario(+req.params.id, usuario.mssql)

        if (desativado.errorID !== undefined) {
            return res.status(500).error(desativado)
        }

        return res.status(200).json({})
    })

    return router
}
