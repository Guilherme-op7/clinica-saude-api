import { Utils } from '@@/libs/utils'
import { cadastroModel } from '@@/models/api/cadastro'
import { TB_PACIENTES, TbPacientesModel } from '@@/models/sql/tbpacientes'
import { TB_USUARIOS, TbUsuariosModel } from '@@/models/sql/tbusuarios'
import { PlataSql } from 'pwi-plata-type'

export namespace TbUsuarios {
    export const get: Sql.SqlGetFunc<typeof TbUsuariosModel, boolean> = async (builder, sql) => {
        const r = await sql.select(TB_USUARIOS, TbUsuariosModel).build(
            s => builder(s).fromRaw(`${ TB_USUARIOS } WITH (NOLOCK)`)
        ).toListAsync()

        if (r.errorID !== undefined) {
            return {
                errorID: 'BLSQLUSURGET001',
                msg: 'Erro ao consultar usuarios',
                error: { stack: new Error().stack, error: r }
            }
        }

        if (r.errors !== undefined) {
            return {
                errorID: 'BLSQLUSURGET002',
                msg: 'Erro ao consultar usuarios',
                error: { stack: new Error().stack, error: r.errors }
            }
        }

        return r.itens
    }

    export async function getByEmailSenha(email: string, senha: string, sql: PlataSql.Driver<false>): PlataPromise<typeof TbUsuariosModel.type> {
        const consulta = await get(s => s
            .where("DS_EMAIL", "=", email)
            .andWhere("DS_SENHA_HASH", "=", Utils.hash(senha))
            .limit(1)
            , sql)

        if (consulta.errorID !== undefined) {
            return {
                errorID: 'BLSQLUSULOGIN001',
                msg: 'Erro ao consultar usuarios',
                error: { stack: new Error().stack, error: consulta }
            }
        }

        if (consulta.length !== 1) {
            return {
                errorID: 'BLSQLUSULOGIN002',
                msg: 'Usuário ou senha incorretos!'
            }
        }

        return consulta[0]
    }

    export async function CadastrarPaciente(infos: typeof cadastroModel.type, sql: PlataSql.Driver<boolean>): PlataPromise<{ idUsuario: number, idPaciente: number }> {
        const emailExistente = await get(s => s
            .where("DS_EMAIL", "=", infos.EMAIL),
            sql)

        if (emailExistente.errorID !== undefined) {
            return {
                errorID: 'BLSQLUSUEMAILVALID001',
                msg: 'Erro ao consultar usuarios',
                error: { stack: new Error().stack, error: emailExistente }
            }
        }

        if (emailExistente.length !== 0) {
            return {
                errorID: 'BLSQLUSUEMAILVALID002',
                msg: 'Email já existente!'
            }
        }

        return sql.transaction(async (trx): PlataPromise<{ idPaciente: number; idUsuario: number }> => {
            const pacientes = await trx.autoInsert(TB_PACIENTES, TbPacientesModel, [{
                DS_NOME: infos.NOME,
                DS_EMAIL: infos.EMAIL,
                NR_CPF: infos.CPF,
                NR_CARTAO_SUS: infos.CARTAOSUS,
                DT_NASCIMENTO: infos.DATANASCIMENTO,
                DS_TELEFONE: infos.TELEFONE,
                TP_STATUS: 'ativo',
            }], ["PK_ID"])

            if (pacientes.errorID !== undefined) {
                return {
                    errorID: 'BLSQLUSUEMAILVALID001',
                    msg: 'Erro ao consultar usuarios',
                    error: { stack: new Error().stack, error: pacientes }
                }
            }

            const pacienteId = pacientes[0].PK_ID

            const usuario = await trx.autoInsert(TB_USUARIOS, TbUsuariosModel, [{
                DS_NOME: infos.NOME,
                DS_EMAIL: infos.EMAIL,
                DS_SENHA_HASH: Utils.hash(infos.SENHA),
                TP_USUARIO: 'paciente',
                FK_PACIENTE: pacienteId,
                FL_ATIVO: true
            }], ['PK_ID', 'FK_FUNCIONARIO'])

            if (usuario.errorID) {
                return {
                    errorID: 'BLSQLUSUEMAILVALID001',
                    msg: 'Erro ao consultar usuarios',
                    error: { stack: new Error().stack, error: pacientes }
                }
            }

            const usuarioId = usuario[0].PK_ID

            return { idPaciente: pacienteId, idUsuario: usuarioId }
        })
    }
}
