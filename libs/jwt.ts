import * as crypto from 'node:crypto'
import { Buffer } from 'node:buffer'
import { JwtConfig } from '@@/configs/jwt'
import { PlataTools } from 'pwi-plata-type'

export namespace Internals {
    export const HexaRegex = /[0-9a-f]/g

    export function isHex(value: string): boolean {
        return value.replace(HexaRegex, '') === ''
    }

    export function hashMd5(text: string): string {
        return crypto.createHash('md5').update(text).digest('hex')
    }
}

export class Jwt<T> {
    private config: typeof JwtConfig

    constructor(config: typeof JwtConfig) {
        this.config = config
    }

    private encrypt(text: string, iv?: Buffer) {
        iv = Buffer.from((iv ?? crypto.randomBytes(16)).toString('hex'), 'hex')

        const cipher = crypto.createCipheriv(
            this.config.alg,
            this.config.secret,
            Uint8Array.from(iv),
        )

        const body = Buffer.concat([
            Uint8Array.from(cipher.update(text)),
            Uint8Array.from(cipher.final())
        ]).toString('hex')

        return { body, iv }
    }

    private decryptVerify(eJson: string, iv: string, eHash: string): PlataResult<JwtValue<T>> {
        eJson = `${eJson}`.toLowerCase()
        iv = `${iv}`.toLowerCase()
        eHash = `${eHash}`.toLowerCase()
        
        if (!Internals.isHex(iv)) {
            return {
                errorID: 'BLJW0005',
                msg: 'Token fornecido é inválido',
                error: `${iv}`
            }
        }

        if (!Internals.isHex(eJson)) {
            return {
                errorID: 'BLJW0006',
                msg: 'Token fornecido é inválido',
                error: `${eJson}`
            }
        }

        if (!Internals.isHex(eHash)) {
            return {
                errorID: 'BLJW0007',
                msg: 'Token fornecido é inválido',
                error: `${eHash}`
            }
        }

        const bufferIv = Buffer.from(iv, 'hex')

        const json = crypto.createDecipheriv(
            this.config.alg,
            this.config.secret,
            Uint8Array.from(bufferIv),
        ).update(eJson, 'hex', 'utf8')

        const hash = crypto.createDecipheriv(
            this.config.alg,
            this.config.secret,
            Uint8Array.from(bufferIv),
        ).update(eHash, 'hex', 'utf8')


        const jHash = Internals.hashMd5(json)

        if (hash.replace(/"/g, '') !== jHash) {
            return {
                errorID: 'BLJW0002',
                msg: 'Token Inválido'
            }
        }

        return JSON.parse(json)
    }

    public create(object: T): string {
        const json = JSON.stringify({ 
            dados: object,
            criado: new Date().getTime(),
            version: this.config.version ?? 0
        })        

        const { body: eHash, iv} = this.encrypt(Internals.hashMd5(json))
        const { body: eJson } = this.encrypt(json, iv)

        return `${eJson}.${iv.toString('hex')}.${eHash}`
    }

    public read(token: string): PlataResult<T> {
        const [ eJson, iv, eHash ] = token.split('.')

        if (eJson === undefined || iv === undefined || eHash  === undefined) {
            return {
                errorID: 'BLJW0001',
                msg: 'Token Inválido'
            }
        }

        const result = this.decryptVerify(eJson, iv, eHash)

        if (result.errorID !== undefined) {
            return result
        }

        if (result.dados === undefined || result.criado === undefined) {
            return {
                errorID: 'BLJW0003',
                msg: 'Token Inválido'
            }
        }

        if (this.config.expires > 0) {
            if (result.criado + this.config.expires <= new Date().getTime()) {
                return {
                    errorID: 'BLJW0004',
                    msg: 'Token Inválido',
                    error: {
                        expirado: true
                    }
                }
            }
        }

        if ((this.config.version ?? 0) > (result.version ?? 0)) {
            return {
                errorID: 'BLJW0008',
                msg: 'Token Inválido',
                error: {
                    expirado: true
                }
            }
        }

        if (result.dados === null) {
            return {
                errorID: 'BLJW0009',
                msg: 'Token Inválido'
            }
        }

        return result.dados
    }
}

export function newJWT<T = any>(config?: typeof JwtConfig): Jwt<T> {
    return new Jwt(config ?? JwtConfig)
}

export function getJWT<T = Dictionary<any>>(): Jwt<T> {
    return Plata.CacheClass(newJWT)
}