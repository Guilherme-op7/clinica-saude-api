import { TB_UNIDADES_SAUDE, tbunidadessaudeModel } from '@@/models/sql/tbunidadessaude'
import type { PlataSql } from 'pwi-plata-type'

export namespace tbunidadessaude {
    export const get: Sql.SqlGetFunc<typeof tbunidadessaudeModel> = async (builder, sql) => {
        const unidades = await sql.select(TB_UNIDADES_SAUDE, tbunidadessaudeModel).build(
            s => builder(s)
                .fromRaw(`${ TB_UNIDADES_SAUDE } WITH (NOLOCK)`)
        ).toListAsync()

        if (unidades.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETUNIDSAUDE001',
                msg: 'Erro ao consultar tabela de Unidades de Saúde',
                error: { stack: new Error().stack, error: unidades }
            }
        }

        if (unidades.errors !== undefined) {
            return {
                errorID: 'BLSQLGETUNIDSAUDE002',
                msg: 'Erro ao consultar tabela de Unidades de Saúde',
                error: { stack: new Error().stack, error: unidades.errors }
            }
        }

        return unidades.itens
    }

    export async function getById(id: number, sql: PlataSql.Driver<false>): PlataPromise<typeof tbunidadessaudeModel.type> {
        const unidade = await get(s => s.where("PK_ID", "=", id), sql)

        if (unidade.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETUNIDSAUDEID001',
                msg: 'Erro ao consultar tabela de Unidades de Saúde',
                error: { stack: new Error().stack, error: unidade }
            }
        }

        if (unidade.length !== 1) {
            return {
                errorID: 'BLSQLGETUNIDSAUDEID002',
                msg: 'Unidade de Saúde não encontrada!',
            }
        }

        return unidade[0]
    }

    export async function CriarUnidadeSaude(info: typeof tbunidadessaudeModel.type, sql: PlataSql.Driver<false>): PlataPromise<{ IdUnidadeSaude: number }> {
        const resposta = await sql.autoInsert(TB_UNIDADES_SAUDE, tbunidadessaudeModel, [{
            DS_UNIDADE: info.DS_UNIDADE,
            DS_ENDERECO: info.DS_ENDERECO,
            DS_TELEFONE: info.DS_TELEFONE
        }], ['PK_ID'])

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLPOSTUNIDSAUDE001',
                msg: 'Erro ao consultar tabela de Unidades de Saúde',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        const id = resposta[0].PK_ID

        return { IdUnidadeSaude: id }
    }

    export async function AtualizarUnidadeSaude(infos: typeof tbunidadessaudeModel.type, sql: PlataSql.Driver<false>): PlataPromise<true> {
        const update = await sql.update(TB_UNIDADES_SAUDE, tbunidadessaudeModel).build(
            s => s
                .where("PK_ID", "=", infos.PK_ID),
            {
                DS_UNIDADE: infos.DS_UNIDADE,
                DS_ENDERECO: infos.DS_ENDERECO,
                DS_TELEFONE: infos.DS_TELEFONE
            }
        )

        if (update.errorID !== undefined) {
            return {
                errorID: 'BLSQLPUTUNIDSAUDE001',
                msg: 'Erro ao atualizar tabela de Unidades de Saúde',
                error: { stack: new Error().stack, error: update }
            }
        }

        return true
    }

    export async function RemoverUnidadeSaude(id: number, sql: PlataSql.Driver<boolean>): PlataPromise<true> {
        return Plata.FastPromise(
            () => sql.conn(TB_UNIDADES_SAUDE).where('PK_ID', id).del()
        ).then(
            () => true,
            err => Plata.BuildPlataError({
                errorID: 'BLSQLDELUNIDSAUDE001',
                msg: 'Erro ao remover unidade de saúde',
                error: err?.toString()
            })
        )
    }
}
