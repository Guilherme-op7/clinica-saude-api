import * as MssqlConfig from '@@/configs/mssql'
import { Knex } from 'knex'
import sql from 'mssql'
import { TYPES } from 'tedious'
import { PlataSql } from 'pwi-plata-type'
import moment from 'moment'
import { AsyncLocalStorage } from 'node:async_hooks'
import { Query } from 'pwi-plata-type/src/libs/sql'
import { ModelTemplate } from 'pwi-plata-type/src/libs/models'


export class Mssql<T extends boolean = false> extends PlataSql.Driver<T> {
    private TableTypeCache: Map<string, MssqlTableType>
    private readonly configMssql: typeof MssqlConfig.default
    public readonly commentContextStorage: AsyncLocalStorage<MssqlAsyncCommentContext>
    public readonly t: typeof sql.TYPES & { TableType:  (name: string) => string }

    constructor(config: typeof MssqlConfig.default, transation: MssqlInTransation) {
        const [server, instance] = config.server.split('\\')

        if (config.options === undefined) {
            config.options = new Object(null)
        }

        config.options.useUTC = false

        const c: Knex.Config = {
            client: 'mssql',
            connection: {
                host: server,
                user: config.user,
                password: config.password,
                database: config.database,
                connTimeout: config.options?.connectTimeout,
                requestTimeout: config.options?.requestTimeout,
                port: config.port,
                options: {
                    encrypt: config.options?.encrypt,
                    trustServerCertificate: config.options?.trustServerCertificate,
                    instanceName: instance,
                    useUTC: false,
                    appName: config.options?.appName,
                    // Ler tbm essa issue para mais detalhes
                    // https://github.com/knex/knex/issues/5268
                    mapBinding: value => {
                        if (typeof value === 'string') {
                            return {
                                type: TYPES.VarChar,
                                value
                            }
                        }

                        if (moment.isMoment(value)) {
                            return {
                                type: TYPES.DateTime,
                                value: value.toDate(),
                            }
                        }

                        if (value instanceof MssqlTVP) {
                            return {
                                type: TYPES.TVP,
                                value,
                            }
                        }
                    }
                } as any,
            },
            pool: config.pool
        }

        if (transation.InTransaction) {
            super(c, true as any, transation.trx.conn)
            this.commentContextStorage = transation.commentContextStorage
        } else {
            super(c, false as any)
            this.commentContextStorage = new AsyncLocalStorage()
        }

        this.t = Object.create(null)

        this.t.TableType = (name) => name

        for (const mssqlType in sql.TYPES) {
            this.t[mssqlType] = sql.TYPES[mssqlType]
        }

        this.TableTypeCache = new Map()
        this.configMssql = config
    }

    public async onOpenTrx(trx: PlataSql.Driver<true>): PlataPromise<PlataSql.Driver<true>> {
        const result: PlataResult<true> = await trx.runRawWithComment({ bindings: [], sql: 'SET XACT_ABORT ON' }).then(
            () => true,
            err => Plata.BuildPlataError({
                errorID: 'BLPEDGETLOCKVEN002',
                msg: 'Erro ao rodar o SET XACT_ABORT ON',
                error: err?.toString(),
            })
        )

        if (result.errorID !== undefined) {
            return result
        }

        return trx
    }

     public async getTransactionDriver(config?: Knex.TransactionConfig): PlataPromise<Mssql<true>> {
        const conn = await super.getTransactionDriver(config)

        if (conn.errorID !== undefined) {
            return conn
        }

        return new Mssql(this.configMssql, { InTransaction: true, trx: conn, commentContextStorage: this.commentContextStorage })
    }

    public async transaction<T extends Sql.TransactionReturn>(transaction: Sql.TransactionResultFunction<Mssql<true>, T>, config?: Knex.TransactionConfig): PlataPromise<T> {
        return super.transaction(transaction, config)
    }

    public selectAll<T = any>(table: string): PlataPromise<T[]> {
        return Plata.FastPromise(
            () => this.conn(table).select('*')
        ).then(
            rows => rows as any,
            err => Plata.BuildPlataError({
                errorID: 'BLMSQL001',
                msg: 'Erro inesperado ao consultar o banco',
                error: err?.toString(),
            })
        )
    }

    private getMssqlTableType(tableTypeName: string): PlataPromise<string[]> {
        return this.conn
            .select('c.name')
            .from('sys.table_types as t')
            .join('sys.columns as c', 'c.object_id', '=', 't.type_table_object_id')
            .where('t.name', '=', tableTypeName)
            .orderBy('c.column_id')
            .then(
                columns => columns.map(c => `${c.name}`),
                err => Plata.BuildPlataError({
                    errorID: 'BLMSQL006',
                    msg: 'Erro de comunicação com o banco',
                    error: err?.toString()
                })
            )
            
    }

    private buildTableType(array: any[], tableType: MssqlTableType): MssqlTVP {
        const table = new MssqlTVP()

        for (const column in tableType.colunas) {
            table.addColumns(column)
        }

        for (let i = 0; i < array.length; i++) {
            const row = tableType.colunas.map(c => {
                const v = array[i][c] ?? null
                return v === null ? null : `${v}`
            })

            table.addRow(row)
        }

        return table
    }

    private async createTableType(array: any[], tableTypeName: string): PlataPromise<MssqlTVP> {
        let tableType: MssqlTableType | undefined = undefined

        if (this.configMssql.tableTypeCache) {
            const t = this.TableTypeCache.get(tableTypeName)

            if (t !== undefined) {
                if ((t.criado.getTime() + this.configMssql.tableTypeCacheLife) <= new Date().getTime()) {
                    tableType = t
                } else {
                    this.TableTypeCache.delete(tableTypeName)
                }
            }
        }

        if (tableType !== undefined) {
            return this.buildTableType(array, tableType)
        }

        const colunas = await this.getMssqlTableType(tableTypeName)

        if (colunas.errorID !== undefined) {
            return colunas
        }

        tableType = {
            colunas,
            criado: new Date()
        }

        this.TableTypeCache.set(tableTypeName, tableType)

        return this.buildTableType(array, tableType)
    }

    public setContext(context: MssqlAsyncCommentContext) {
        this.commentContextStorage.enterWith(context)
    }

    public updateContext<K extends keyof MssqlAsyncCommentContext>(key: K, value: MssqlAsyncCommentContext[K]) {
        const store = this.commentContextStorage.getStore()

        if (store === undefined) {
            return
        }

        store[key] = value
    }

    public applyContextComments<T extends { comments?: Record<string, string> }>(options?: T): T {
        if (options === undefined) {
            options = Object.create(null) as T
        }

        const commentsContext = this.commentContextStorage.getStore()

        options.comments = {
            ...options.comments,
            ...commentsContext,
        }

        return options
    }

    public autoInsert<T extends Model.Template, C extends Model.Converters<T>>(table: string, model: ModelTemplate<T, C>, values: (Model.ParcialTemplateType<T>)[], ignore: StringKeyOfObject<T>[], options?: Sql.InsertOptions): PlataPromise<Model.ExtractTemplateType<T>[]> {
        options = this.applyContextComments(options)
        
        return super.autoInsert(table, model, values, ignore, options)
    }

    public select<T extends Model.Template, C extends Model.Converters<T>>(table: string, model: ModelTemplate<T, C>, options?: Sql.SelectOptions): { build: (builder: Sql.Builder<T>) => Query<T, C> } {
        options = this.applyContextComments(options)

        return super.select(table, model, options)
    }

    public update<T extends Model.Template, C extends Model.Converters<T>>(table: string, model: ModelTemplate<T, C>, options?: Sql.UpdateOptions): { build: (s: Sql.Builder<T>, set: Partial<Model.ExtractTemplateType<T>>) => PlataPromise<true> } {
        options = this.applyContextComments(options)

        return super.update(table, model, options)
    }

    public insert<T extends Model.Template, C extends Model.Converters<T>>(table: string, model: ModelTemplate<T, C>, values: Model.ParcialTemplateType<T>[], options?: Sql.InsertOptions): PlataPromise<Model.ExtractTemplateType<T>[]> {
        options = this.applyContextComments(options)

        return super.insert(table, model, values, options)
    }

    private hasApplyContextComments<T extends PlataSql.Driver<boolean>>(connClass: T): connClass is (T & Pick<Mssql<boolean>, 'applyContextComments'>) {
        return typeof (connClass as any).applyContextComments === 'function'
    }

    public executeProcedure<T = any>(procedure: string, params: MssqlRequestParams[], sql?: PlataSql.Driver<boolean>): PlataPromise<T[]> {
        const connClass = sql ?? this
        let options: { comments?: Record<string, string> } = Object.create(null)

        if (this.hasApplyContextComments(connClass)) {
            options = connClass.applyContextComments(options)
        }
        
        // Verifica se tem Table Type
        for (let i = 0; i < params.length; i++) {

            // Hit
            if (typeof params[i].type === 'string') {
                params[i].value = this.createTableType(params[i].value, params[i].type as any)
            }
        }

        return connClass.runRawWithComment(
            {
                sql: `EXEC ${procedure} ${params.map(() => '?').join(',')}`,
                bindings: params.map(p => p.value)
            },
            options.comments,
        ).then(
            r => r,
            err => Plata.BuildPlataError({
                errorID: 'BLMSQL011',
                msg: 'Erro ao execultar a procedure',
                error: err?.toString()
            })
        )
    }
}

export class MssqlTVP {
    public readonly columns: Array<{ name: string, type: typeof TYPES[keyof typeof TYPES] }> = new Array()
    public readonly rows: Array<(string | null)[]> = new Array()

    constructor(
        public readonly name?: string | undefined,
        public readonly schema?: string | undefined
    ) {}

    public addColumns(name: string) {
        this.columns.push({ name, type: TYPES.NVarChar })
    }

    public addRow(row: Array<string | null>) {
        this.rows.push(row)
    }

    public addRows(rows: Array<(string | null)[]>) {
        this.rows.push(...rows)
    }
}

export function newMssql(config?: typeof MssqlConfig.default): MssqlLib {
    const libMssql: any = new Mssql(config ?? MssqlConfig.default, { InTransaction: false })

    libMssql.TableType = (name) => name

    for (const mssqlType in sql.TYPES) {
        libMssql[mssqlType] = sql.TYPES[mssqlType]
    }

    return libMssql
}

export function getMssql(): MssqlLib {
    return Plata.CacheClass(newMssql)
}