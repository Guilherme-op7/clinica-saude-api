import { TB_PACIENTES, TbPacientesModel } from '@@/models/sql/tbpacientes'

type PacienteDados = Omit<typeof TbPacientesModel.type, 'PK_ID' | 'TP_STATUS'>

export namespace TbPacientes {
    export const get: Sql.SqlGetFunc<typeof TbPacientesModel> = async (builder, sql) => {
        const resposta = await sql.select(TB_PACIENTES, TbPacientesModel).build(
            s => builder(s)
                .fromRaw(`${ TB_PACIENTES } WITH (NOLOCK)`)
        ).toListAsync()

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETPACIENTES001',
                msg: 'Erro ao consultar tabela de pacientes',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        if (resposta.errors !== undefined) {
            return {
                errorID: 'BLSQLGETPACIENTES002',
                msg: 'Erro ao consultar tabela de pacientes',
                error: { stack: new Error().stack, error: resposta.errors }
            }
        }

        return resposta.itens
    }

    export async function getById(id: number, sql: MssqlLib): PlataPromise<typeof TbPacientesModel.type> {
        const paciente = await get(s => s.where('PK_ID', '=', id), sql)

        if (paciente.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETPACIENTEID001',
                msg: 'Erro ao consultar tabela de pacientes',
                error: { stack: new Error().stack, error: paciente }
            }
        }

        if (paciente.length !== 1) {
            return {
                errorID: 'BLSQLGETPACIENTEID002',
                msg: 'Paciente não encontrado!'
            }
        }

        return paciente[0]
    }

    interface pacientesFiltros {
        nome?: string
        status?: 'ativo' | 'inativo'
    }

    export async function ListarPacientesFiltro(filtros: pacientesFiltros, sql: MssqlLib): PlataPromise<typeof TbPacientesModel.type[]> {
        return get(s => {
            if (filtros.nome !== undefined) {
                s = s.andWhere('DS_NOME', 'like', `%${ filtros.nome }%`)
            }

            if (filtros.status !== undefined) {
                s = s.andWhere('TP_STATUS', '=', filtros.status)
            }

            return s
        }, sql)
    }

    function paramsDados(info: PacienteDados, sql: MssqlLib): MssqlRequestParams[] {
        return [
            { name: 'DS_NOME', type: sql.VarChar, value: info.DS_NOME },
            { name: 'NR_CPF', type: sql.VarChar, value: info.NR_CPF ?? null },
            { name: 'NR_CARTAO_SUS', type: sql.VarChar, value: info.NR_CARTAO_SUS ?? null },
            { name: 'DT_NASCIMENTO', type: sql.SmallDateTime, value: info.DT_NASCIMENTO ?? null },
            { name: 'TP_SEXO', type: sql.VarChar, value: info.TP_SEXO ?? null },
            { name: 'DS_TELEFONE', type: sql.VarChar, value: info.DS_TELEFONE ?? null },
            { name: 'DS_EMAIL', type: sql.VarChar, value: info.DS_EMAIL ?? null },
            { name: 'DS_ENDERECO', type: sql.VarChar, value: info.DS_ENDERECO ?? null },
            { name: 'DS_TIPO_SANGUINEO', type: sql.VarChar, value: info.DS_TIPO_SANGUINEO ?? null },
            { name: 'DS_ALERGIAS', type: sql.VarChar, value: info.DS_ALERGIAS ?? null },
            { name: 'DS_CONTATO_EMERGENCIA', type: sql.VarChar, value: info.DS_CONTATO_EMERGENCIA ?? null },
        ]
    }

    export async function CadastrarPaciente(info: PacienteDados, sql: MssqlLib): PlataPromise<{ idpaciente: number }> {
        const resposta = await sql.executeProcedure<{ PK_ID: number }>('SP_PACIENTES_CADASTRAR', paramsDados(info, sql))

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLPOSTPACIENTE001',
                msg: 'Erro ao cadastrar paciente',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return { idpaciente: resposta[0].PK_ID }
    }

    export async function AtualizarPaciente(id: number, info: PacienteDados, sql: MssqlLib): PlataPromise<true> {
        const resposta = await sql.executeProcedure('SP_PACIENTES_ATUALIZAR', [
            { name: 'PK_ID', type: sql.Int, value: id },
            ...paramsDados(info, sql),
        ])

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLPUTPACIENTE001',
                msg: 'Erro ao atualizar paciente',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return true
    }

    export async function DesativarPaciente(id: number, sql: MssqlLib): PlataPromise<true> {
        const resposta = await sql.executeProcedure('SP_PACIENTES_DESATIVAR', [
            { name: 'PK_ID', type: sql.Int, value: id },
        ])

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLDELPACIENTE001',
                msg: 'Erro ao desativar paciente',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        return true
    }
}
