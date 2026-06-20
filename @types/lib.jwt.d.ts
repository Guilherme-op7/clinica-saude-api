import { CipherGCMTypes, CipherCCMTypes, CipherOCBTypes } from 'node:crypto'

declare global  {
    interface JwtValue<T> {
        criado: number
        dados: T
        version?: number
    }

    interface JwtConfig {
        expires: number, // 0 = não expira
        alg: CipherGCMTypes
        secret: string,  // tamanho 32 caracteres
        version?: number, // versao minima aceita do Objeto do Json
    }
}
