import { PlataModels } from 'pwi-plata-type'
import { Tools } from '@@/libs/tools'

const login = new PlataModels.ModelTemplate({
    email: [PlataModels.Required(), PlataModels.VarChar(255)],
    senha: [PlataModels.Required(), PlataModels.VarChar(Infinity)],
} as const, {})

login.addFilter('trim', Tools.trimModel)

export const loginModel = login
