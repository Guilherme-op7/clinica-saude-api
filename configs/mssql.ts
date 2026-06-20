const c: MssqlConfig = {
    server: Plata.config.MSSQL_HOST ?? '',
    port: Plata.config.MSSQL_PORT === undefined ? undefined : +Plata.config.MSSQL_PORT || undefined,
    user: Plata.config.MSSQL_USER ?? '',
    password: Plata.config.MSSQL_PASSWORD ?? '',
    database: Plata.config.MSSQL_DATABASE ?? '',
    tableTypeCache: Plata.config.MSSQL_TTPCACHE === 'true',
    tableTypeCacheLife: Plata.config.MSSQL_TTPCACHELIFE === undefined ? 5000 : +Plata.config.MSSQL_TTPCACHELIFE || 5000,
    // Extras
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 5000,
        requestTimeout: 2147483647, // Tempo maximo de timeout suportado no Nodejs
    }
}

export default c