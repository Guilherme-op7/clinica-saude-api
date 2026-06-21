import { createHash } from 'node:crypto'

export namespace Utils {
    export function hash(value: string): string {
        return createHash('sha256').update(value).digest('hex')
    }

    interface Usuario<K extends TApi.Token['type']> {
        token: Extract<TApi.Token, { type: K }>
        mssql: MssqlLib
    }

    export function getUsuario<K extends TApi.Token['type']>(infoUser: TApi.InfoUsuario, experado: K): PlataResult<Usuario<K>> {
        if (infoUser.token.type !== experado) {
            return {
                errorID: 'BUTOKVALI001',
                msg: 'Token inválido'
            }
        }

        return {
            mssql: infoUser.mssql,
            token: infoUser.token as any
        }
    }

    export function getUsuarioOneOf<K extends TApi.Token['type']>(infoUser: TApi.InfoUsuario, esperados: K[]): PlataResult<Usuario<K>> {
        if (!esperados.includes(infoUser.token.type as K)) {
            return {
                errorID: 'BUTOKVALI002',
                msg: 'Você não tem permissão para realizar esta ação'
            }
        }

        return {
            mssql: infoUser.mssql,
            token: infoUser.token as any
        }
    }
}
