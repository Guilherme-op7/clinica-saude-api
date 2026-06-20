declare global {
    namespace TApi {
        type Token =
            | TokenAdmin
            | TokenRecepcao
            | TokenMedico
            | TokenPaciente
        ;

        interface TokenBase {
            idUsuario: number
            nome: string
            email: string
        }

        interface TokenAdmin extends TokenBase {
            type: 'ADMIN'
        }

        interface TokenRecepcao extends TokenBase {
            type: 'RECEPCAO'
            fkFuncionario: number
        }

        interface TokenMedico extends TokenBase {
            type: 'MEDICO'
            fkFuncionario: number
            fkMedico: number
        }

        interface TokenPaciente extends TokenBase {
            type: 'PACIENTE'
            fkPaciente: number
        }

        interface InfoUsuario {
            token: Token
            mssql: MssqlLib
        }
    }
}

export {}
