export const JwtConfig: JwtConfig = {
    expires: Plata.config.JWT_EXPIRES === undefined ? 0 : +Plata.config.JWT_EXPIRES || 0, // ms, 0 = não expira
    alg: 'aes-256-gcm',
    secret: Plata.config.JWT_SECRET ?? '00000000000000000000000000000000', // precisa ter 32 caracteres
    version: Plata.config.JWT_VERSION === undefined ? 0 : +Plata.config.JWT_VERSION || 0,
}
