import { TB_MEDICOS, tbmedicosModel } from '@@/models/sql/tbmedicos'

type MedicoDados = Omit<typeof tbmedicosModel.type, 'PK_ID' | 'FL_ATIVO'>

export namespace tbmedicos {
    export const get: Sql.SqlGetFunc<typeof tbmedicosModel> = async (builder, sql) => {
        const resposta = await sql.select(TB_MEDICOS, tbmedicosModel).build(
            s => builder(s)
                .fromRaw(`${ TB_MEDICOS } WITH (NOLOCK)`)
        ).toListAsync()

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETMEDICOS001',
                msg: 'Erro ao consultar tabela de médicos',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        if (resposta.errors !== undefined) {
            return {
                errorID: 'BLSQLGETMEDICOS002',
                msg: 'Erro ao consultar tabela de médicos',
                error: { stack: new Error().stack, error: resposta.errors }
            }
        }

        return resposta.itens
    }

    export async function getById(id: number, sql: MssqlLib): PlataPromise<typeof tbmedicosModel.type> {
        const medico = await get(s => s.where('PK_ID', '=', id), sql)

        if (medico.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETMEDICOID001',
                msg: 'Erro ao consultar tabela de médicos',
                error: { stack: new Error().stack, error: medico }
            }
        }

        if (medico.length !== 1) {
            return {
                errorID: 'BLSQLGETMEDICOID002',
                msg: 'Médico(a) não encontrado!'
            }
        }

        return medico[0]
    }

    interface medicosFiltros {
        especialidade?: number
        ativo?: boolean
    }

    export async function ListarMedicosFiltro(filtros: medicosFiltros, sql: MssqlLib): PlataPromise<typeof tbmedicosModel.type[]> {
        return get(s => {
            if (filtros.especialidade !== undefined) {
                s = s.andWhere('FK_ESPECIALIDADE', '=', filtros.especialidade)
            }

            if (filtros.ativo !== undefined) {
                s = s.andWhere('FL_ATIVO', '=', filtros.ativo ? 1 : 0)
            }

            return s
        }, sql)
    }

    function paramsDados(info: MedicoDados, sql: MssqlLib): MssqlRequestParams[] {
        return [
            { name: 'FK_FUNCIONARIO', type: sql.Int, value: info.FK_FUNCIONARIO },
            { name: 'FK_ESPECIALIDADE', type: sql.Int, value: info.FK_ESPECIALIDADE },
            { name: 'NR_CRM', type: sql.VarChar, value: info.NR_CRM },
            { name: 'DS_UF_CRM', type: sql.VarChar, value: info.DS_UF_CRM },
        ]
    }

    export async function CadastrarMedico(info: MedicoDados, sql: MssqlLib): PlataPromise<{ idmedico: number }> {
        const resposta = await sql.executeProcedure<{ PK_ID: number }>('SP_MEDICOS_CADASTRAR', paramsDados(info, sql))

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLPOSTMEDICO001',
                msg: 'Erro ao cadastrar médico',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return { idmedico: resposta[0].PK_ID }
    }

    export async function AtualizarMedico(id: number, info: MedicoDados, sql: MssqlLib): PlataPromise<true> {
        const resposta = await sql.executeProcedure('SP_MEDICOS_ATUALIZAR', [
            { name: 'PK_ID', type: sql.Int, value: id },
            ...paramsDados(info, sql),
        ])

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLPUTMEDICO001',
                msg: 'Erro ao atualizar médico',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return true
    }

    export async function DesativarMedico(id: number, sql: MssqlLib): PlataPromise<true> {
        const resposta = await sql.executeProcedure('SP_MEDICOS_DESATIVAR', [
            { name: 'PK_ID', type: sql.Int, value: id },
        ])

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLDELMEDICO001',
                msg: 'Erro ao desativar médico',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return true
    }
}
