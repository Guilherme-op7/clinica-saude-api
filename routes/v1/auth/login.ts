import { getJWT } from '@@/libs/jwt'
import { TbUsuarios } from '@@/libs/sql/tbusuarios'
import { loginModel } from '@@/models/api/login'

export default async function (router: Router.Router): Promise<Router.Router> {
    const jwt = getJWT<TApi.Token>()

    router.post('/', async (req, res) => {
        const sql = req.extras

        const dados = await loginModel.validate(req.body)

        if (dados.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1AULO001',
                msg: 'Erro ao validar os dados de login',
                error: dados.errors
            })
        }

        const usuario = await TbUsuarios.getByEmailSenha(dados.value.email, dados.value.senha, sql)

        if (usuario.errorID !== undefined) {
            return res.status(401).error(usuario)
        }

        const base = {
            idUsuario: usuario.PK_ID,
            nome: usuario.DS_NOME,
            email: usuario.DS_EMAIL,
        }

        let token: TApi.Token

        switch (usuario.TP_USUARIO) {
            case 'admin': {
                token = { ...base, type: 'ADMIN' }
                break
            }

            case 'recepcao': {
                if (usuario.FK_FUNCIONARIO === null) {
                    return res.status(500).error({
                        errorID: 'BR1AULO002',
                        msg: 'Usuário de recepção sem funcionário vinculado'
                    })
                }

                token = { ...base, type: 'RECEPCAO', fkFuncionario: usuario.FK_FUNCIONARIO }
                break
            }

            case 'medico': {
                if (usuario.FK_FUNCIONARIO === null) {
                    return res.status(500).error({
                        errorID: 'BR1AULO003',
                        msg: 'Usuário médico sem funcionário vinculado'
                    })
                }

                // TODO: quando libs/sql/tbmedicos.ts existir, buscar o pk_id de tb_medicos
                token = { ...base, type: 'MEDICO', fkFuncionario: usuario.FK_FUNCIONARIO, fkMedico: 0 }
                break
            }

            case 'paciente': {
                if (usuario.FK_PACIENTE === null) {
                    return res.status(500).error({
                        errorID: 'BR1AULO004',
                        msg: 'Usuário paciente sem paciente vinculado'
                    })
                }

                token = { ...base, type: 'PACIENTE', fkPaciente: usuario.FK_PACIENTE }
                break
            }

            default: {
                return res.status(500).error({
                    errorID: 'BR1AULO005',
                    msg: 'Tipo de usuário desconhecido'
                })
            }
        }

        return res.status(200).json({
            token: jwt.create(token),
            nome: usuario.DS_NOME,
            tipoUsuario: usuario.TP_USUARIO
        })
    })

    return router
}
