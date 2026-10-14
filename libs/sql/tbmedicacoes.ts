import { TB_MEDICACOES, tbmedicacoesModel } from '@@/models/sql/tbmedicacoes'

type MedicacaoDados = Omit<typeof tbmedicacoesModel.type, 'PK_ID' | 'FL_ATIVO'>

export namespace tbmedicacoes {
    export const get: Sql.SqlGetFunc<typeof tbmedicacoesModel> = async (builder, sql) => {
        const resposta = await sql.select(TB_MEDICACOES, tbmedicacoesModel).build(
            s => builder(s)
                .fromRaw(`${ TB_MEDICACOES } WITH (NOLOCK)`)
        ).toListAsync()

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETMEDICACOES001',
                msg: 'Erro ao consultar tabela de medicações',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        if (resposta.errors !== undefined) {
            return {
                errorID: 'BLSQLGETMEDICACOES002',
                msg: 'Erro ao consultar tabela de medicações',
                error: { stack: new Error().stack, error: resposta.errors }
            }
        }

        return resposta.itens
    }

    export async function getById(id: number, sql: MssqlLib): PlataPromise<typeof tbmedicacoesModel.type> {
        const medicacao = await get(s => s.where('PK_ID', '=', id), sql)

        if (medicacao.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETMEDICACAOID001',
                msg: 'Erro ao consultar tabela de medicações',
                error: { stack: new Error().stack, error: medicacao }
            }
        }

        if (medicacao.length !== 1) {
            return {
                errorID: 'BLSQLGETMEDICACAOID002',
                msg: 'Medicação não encontrada!'
            }
        }

        return medicacao[0]
    }

    interface medicacoesFiltros {
        nome?: string
        controlada?: boolean
        ativo?: boolean
    }

    export async function ListarMedicacoesFiltro(filtros: medicacoesFiltros, sql: MssqlLib): PlataPromise<typeof tbmedicacoesModel.type[]> {
        return get(s => {
            if (filtros.nome !== undefined) {
                s = s.andWhere('DS_NOME', 'like', `%${ filtros.nome }%`)
            }

            if (filtros.controlada !== undefined) {
                s = s.andWhere('FL_CONTROLADA', '=', filtros.controlada ? 1 : 0)
            }

            if (filtros.ativo !== undefined) {
                s = s.andWhere('FL_ATIVO', '=', filtros.ativo ? 1 : 0)
            }

            return s
        }, sql)
    }

    function paramsDados(info: MedicacaoDados, sql: MssqlLib): MssqlRequestParams[] {
        return [
            { name: 'DS_NOME', type: sql.VarChar, value: info.DS_NOME },
            { name: 'DS_PRINCIPIO_ATIVO', type: sql.VarChar, value: info.DS_PRINCIPIO_ATIVO ?? null },
            { name: 'DS_FABRICANTE', type: sql.VarChar, value: info.DS_FABRICANTE ?? null },
            { name: 'DS_FORMA_FARMACEUTICA', type: sql.VarChar, value: info.DS_FORMA_FARMACEUTICA },
            { name: 'DS_DOSAGEM', type: sql.VarChar, value: info.DS_DOSAGEM },
            { name: 'FL_CONTROLADA', type: sql.Bit, value: info.FL_CONTROLADA },
            { name: 'DS_OBSERVACOES', type: sql.VarChar, value: info.DS_OBSERVACOES ?? null },
        ]
    }

    export async function CadastrarMedicacao(info: MedicacaoDados, sql: MssqlLib): PlataPromise<{ idmedicacao: number }> {
        const resposta = await sql.executeProcedure<{ PK_ID: number }>('SP_MEDICACOES_CADASTRAR', paramsDados(info, sql))

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLPOSTMEDICACAO001',
                msg: 'Erro ao cadastrar medicação',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return { idmedicacao: resposta[0].PK_ID }
    }

    export async function AtualizarMedicacao(id: number, info: MedicacaoDados, sql: MssqlLib): PlataPromise<true> {
        const resposta = await sql.executeProcedure('SP_MEDICACOES_ATUALIZAR', [
            { name: 'PK_ID', type: sql.Int, value: id },
            ...paramsDados(info, sql),
        ])

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLPUTMEDICACAO001',
                msg: 'Erro ao atualizar medicação',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return true
    }

    export async function DesativarMedicacao(id: number, sql: MssqlLib): PlataPromise<true> {
        const resposta = await sql.executeProcedure('SP_MEDICACOES_DESATIVAR', [
            { name: 'PK_ID', type: sql.Int, value: id },
        ])

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLDELMEDICACAO001',
                msg: 'Erro ao desativar medicação',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return true
    }
}
