import { Mssql } from '@@/libs/mssql'
import sql, { config, ISqlType } from 'mssql'
import { PlataSql } from 'pwi-plata-type'
import { AsyncLocalStorage } from 'node:async_hooks'

declare global {
    interface MssqlAsyncCommentContext {
    
    }

    interface MssqlTableTypeConfig {
        tableTypeCache: boolean,
        tableTypeCacheLife: number // ms
    }

    interface MssqlConfig extends config, MssqlTableTypeConfig {}

    type MssqlTypes = typeof sql.TYPES & { TableType:  (name: string) => string }
 
    type MssqlLib = Mssql & MssqlTypes

    interface MssqlTableType {
        colunas: string[]
        criado: Date
    }
    
    type MssqlType = (() => ISqlType) | ISqlType | string

    type MssqlInTransation = {
        InTransaction: true
        trx: PlataSql.Driver<true>
        commentContextStorage: AsyncLocalStorage<MssqlAsyncCommentContext>
    } | {
        InTransaction: false
    }
    
    export interface MssqlRequestParams {
        name: string,
        value: any,
        type: MssqlType
    }
}