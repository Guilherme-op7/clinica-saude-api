import { TB_FUNCIONARIOS, tbfuncionariosModel } from '@@/models/sql/tbfuncionarios'
import type { PlataSql } from 'pwi-plata-type'

export namespace tbfuncionarios {
    export const get: Sql.SqlGetFunc<typeof tbfuncionariosModel> = async (builder, sql) => {
        const resposta = await sql.select(TB_FUNCIONARIOS, tbfuncionariosModel).build(
            s => builder(s)
                .fromRaw(`${ TB_FUNCIONARIOS } WITH (NOLOCK)`)
        ).toListAsync()

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETFUNC001',
                msg: 'Erro ao consultar tabela de funcionários',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        if (resposta.errors !== undefined) {
            return {
                errorID: 'BLSQLGETFUNC002',
                msg: 'Erro ao consultar tabela de funcionários',
                error: { stack: new Error().stack, error: resposta.errors }
            }
        }

        return resposta.itens
    }

    export async function getById(id: number, sql: PlataSql.Driver<false>): PlataPromise<typeof tbfuncionariosModel.type> {
        const funcionario = await get(s => s
            .where("PK_ID", "=", id)
            , sql)

        if (funcionario.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETFUNCID001',
                msg: 'Erro ao consultar tabela de funcionários',
                error: { stack: new Error().stack, error: funcionario }
            }
        }

        if (funcionario.length !== 1) {
            return {
                errorID: 'BLSQLGETFUNCID002',
                msg: 'Funcionário(a) não encontrado!',
            }
        }

        return funcionario[0]
    }

    interface funcionariosFiltros {
        departamento?: string
        cargo?: string
        ativo?: boolean
    }

    export async function ListarFuncionariosFiltro(filtros: funcionariosFiltros, sql: PlataSql.Driver<false>): PlataPromise<typeof tbfuncionariosModel.type[]> {
        return get(s => {
            if (filtros.departamento !== undefined) {
                s = s.andWhere('DS_DEPARTAMENTO', '=', filtros.departamento)
            }

            if (filtros.cargo !== undefined) {
                s = s.andWhere('DS_CARGO', '=', filtros.cargo)
            }

            if (filtros.ativo !== undefined) {
                s = s.andWhere('FL_ATIVO', '=', filtros.ativo ? 1 : 0)
            }

            return s
        }, sql)
    }

    export async function CadastrarFuncionario(info: typeof tbfuncionariosModel.type, sql: PlataSql.Driver<false>): PlataPromise<{ idfuncionario: number }> {
        const resposta = await get(s => s
            .where("DS_EMAIL", "=", info.DS_EMAIL)
            .orWhere("NR_CPF", "=", info.NR_CPF)
            , sql)

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETTBFUNCIONARIO003',
                msg: 'Erro ao buscar funcionario na tabela de funcionario',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        if (resposta.length !== 0) {
            return {
                errorID: 'BLSQLUSUEMAILVALID002',
                msg: 'Email ou cpf já existente!'
            }
        }

        const cadfuncionario = await sql.autoInsert(TB_FUNCIONARIOS, tbfuncionariosModel, [{
            DS_NOME: info.DS_NOME,
            DS_EMAIL: info.DS_EMAIL,
            DS_TELEFONE: info.DS_TELEFONE,
            DS_CARGO: info.DS_CARGO,
            DS_DEPARTAMENTO: info.DS_DEPARTAMENTO,
            NR_CPF: info.NR_CPF,
            VL_SALARIO: info.VL_SALARIO,
            DT_ADMISSAO: info.DT_ADMISSAO,
            FL_ATIVO: true
        }], ['PK_ID', 'DT_DEMISSAO'])

        if (cadfuncionario.errorID !== undefined) {
            return {
                errorID: 'BLSQLPOSTFUNCIONARIO001',
                msg: 'Erro ao cadastrar funcionario na tabela de funcionario',
                error: { stack: new Error().stack, error: cadfuncionario }
            }
        }

        return { idfuncionario: cadfuncionario[0].PK_ID }
    }

    export async function AtualizarFuncionario(infos: typeof tbfuncionariosModel.type, sql: PlataSql.Driver<boolean>): PlataPromise<true> {
        const update = await sql.update(TB_FUNCIONARIOS, tbfuncionariosModel).build(
            s => s.where("PK_ID", "=", infos.PK_ID),
            {
                DS_NOME: infos.DS_NOME,
                DS_EMAIL: infos.DS_EMAIL,
                DS_TELEFONE: infos.DS_TELEFONE,
                DS_CARGO: infos.DS_CARGO,
                DS_DEPARTAMENTO: infos.DS_DEPARTAMENTO,
                NR_CPF: infos.NR_CPF,
                VL_SALARIO: infos.VL_SALARIO,
            }
        )

        if (update.errorID !== undefined) {
            return {
                errorID: 'BLSQLPUTFUNCIONARIO001',
                msg: 'Erro ao atualizar tabela de funcionário',
                error: { stack: new Error().stack, error: update }
            }
        }

        return true
    }

    export async function DesativarFuncionario(id: number, sql: PlataSql.Driver<boolean>): PlataPromise<true> {
        const desativado = await sql.update(TB_FUNCIONARIOS, tbfuncionariosModel).build(
            s => s.where("PK_ID", "=", id),
            {
                FL_ATIVO: false,
                DT_DEMISSAO: new Date()
            }
        )

        if (desativado.errorID !== undefined) {
            return {
                errorID: 'BLSQLDELFUNCIONARIO001',
                msg: 'Erro ao desativar funcionário',
                error: { stack: new Error().stack, error: desativado }
            }
        }

        return true
    }
}
