export namespace Tools {
    export function trimModel<T extends Dictionary<any>>(x: T): T {
        for (const key in x) {
            if (x[key] === null) continue
            if ((x[key] as any) instanceof Date) continue

            if (typeof x[key] === 'string') {
                x[key] = x[key].trim()
                continue
            }

            if (Array.isArray(x[key])) {
                for (let i = 0; i < x[key].length; i++) {
                    x[key][i] = trimModel(x[key][i])
                }
                continue
            }

            if (typeof x[key] === 'object') {
                x[key] = trimModel(x[key])
            }
        }

        return x
    }

    export function validarDigitosCPF(cpf: string): boolean {
        cpf = cpf.replace(/\D/g, '').padStart(11, '0')

        if (/^(\d)\1{10}$/.test(cpf)) return false

        let soma = 0
        for (let i = 0; i < 9; i++) {
            soma += (+cpf[i]) * (10 - i)
        }
        let resto = (soma * 10) % 11
        if (resto === 10) resto = 0
        if (resto !== +cpf[9]) return false

        soma = 0
        for (let i = 0; i < 10; i++) {
            soma += (+cpf[i]) * (11 - i)
        }
        resto = (soma * 10) % 11
        if (resto === 10) resto = 0
        if (resto !== +cpf[10]) return false

        return true
    }
}
