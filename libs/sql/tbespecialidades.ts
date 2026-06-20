import { TB_ESPECIALIDADES, tbespecialidadesModel } from '@@/models/sql/tbespecialidades'
import type { PlataSql } from 'pwi-plata-type'

export namespace tbespecialidades {
    export const get: Sql.SqlGetFunc<typeof tbespecialidadesModel> = async (builder, sql) => {
        const resposta = await sql
            .select(TB_ESPECIALIDADES, tbespecialidadesModel)
            .build(s => builder(s).fromRaw(`${ TB_ESPECIALIDADES } WITH (NOLOCK)`))
            .toListAsync()

        if (resposta.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETTBESPECIALIDADES001',
                msg: 'Não foi possível consultar a tabela de especialidades',
                error: { stack: new Error().stack, error: resposta }
            }
        }

        if (resposta.errors !== undefined) {
            return {
                errorID: 'BLSQLGETTBESPECIALIDADES002',
                msg: 'Não foi possível consultar a tabela de especialidades',
                error: { stack: new Error().stack, error: resposta.errors }
            }
        }

        return resposta.itens
    }

    export async function ListarEspecialidadesId(id: number, sql: PlataSql.Driver<false>): PlataPromise<typeof tbespecialidadesModel.type> {
        const lista = await get(s => s.where('PK_ID', '=', id), sql)

        if (lista.errorID !== undefined) {
            return {
                errorID: 'BLSQLGETTBESPECIALIDADES003',
                msg: 'Erro ao buscar especialidades na tabela de especialidades',
                error: { stack: new Error().stack, error: lista }
            }
        }

        if (lista.length !== 1) {
            return {
                errorID: 'BLSQLGETTBESPECIALIDADES004',
                msg: 'Especialidade não encontrada'
            }
        }

        return lista[0]
    }

    export async function CriarEspecialidades(info: typeof tbespecialidadesModel.type, sql: PlataSql.Driver<boolean>): PlataPromise<{ pkid: number }> {
        const especialidades = await sql.autoInsert(TB_ESPECIALIDADES, tbespecialidadesModel, [{
            DS_ESPECIALIDADE: info.DS_ESPECIALIDADE,
            VL_CONSULTA: info.VL_CONSULTA,
            DS_COR: info.DS_COR
        }], ['PK_ID'])

        if (especialidades.errorID !== undefined) {
            return {
                errorID: 'BLSQLPOSTCADASNOVESPEC001',
                msg: 'Erro ao inserir na tabela de especialidades',
                error: { stack: new Error().stack, error: especialidades }
            }
        }

        return { pkid: especialidades[0].PK_ID }
    }

    export async function AtualizarEspecialidades(infos: typeof tbespecialidadesModel.type, sql: PlataSql.Driver<boolean>): PlataPromise<true> {
        const atuEspecialidade = await sql
            .update(TB_ESPECIALIDADES, tbespecialidadesModel)
            .build(s => s.where('PK_ID', '=', infos.PK_ID), {
                DS_ESPECIALIDADE: infos.DS_ESPECIALIDADE,
                VL_CONSULTA: infos.VL_CONSULTA,
                DS_COR: infos.DS_COR
            })

        if (atuEspecialidade.errorID !== undefined) {
            return {
                errorID: 'BLSQLPUTATUESPEC001',
                msg: 'Erro ao inserir na tabela de especialidades',
                error: { stack: new Error().stack, error: atuEspecialidade }
            }
        }

        return true
    }

    export async function RemoverEspecialidades(id: number, sql: PlataSql.Driver<boolean>): PlataPromise<true> {
        return Plata.FastPromise(
            () => sql.conn(TB_ESPECIALIDADES).where('PK_ID', id).del()
        ).then(
            () => true,
            err => Plata.BuildPlataError({
                errorID: 'BLSQLDELESPEC001',
                msg: 'Erro ao remover especialidade',
                error: err?.toString()
            })
        )
    }
}
