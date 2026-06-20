import { PlataModels } from 'pwi-plata-type'
import { Tools } from '@@/libs/tools'

const cadastro = new PlataModels.ModelTemplate({
    NOME:           [PlataModels.Required(), PlataModels.VarChar(255)],
    EMAIL:          [PlataModels.Required(), PlataModels.VarChar(255)],
    SENHA:          [PlataModels.Required(), PlataModels.VarChar(500)],
    CPF:            [PlataModels.Required(), PlataModels.VarChar(14)],
    CARTAOSUS:      [PlataModels.Required(), PlataModels.VarChar(30)],
    DATANASCIMENTO: [PlataModels.Required(), PlataModels.SmallDateTime()],
    TELEFONE:       [PlataModels.Required(), PlataModels.VarChar(20)],
} as const, {})

cadastro.addFilter('trim', Tools.trimModel)

export const cadastroModel = cadastro
