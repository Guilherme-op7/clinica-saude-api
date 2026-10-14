import { Tools } from '@@/libs/tools'
import { PlataModels } from 'pwi-plata-type'

const cadastrarmedico = new PlataModels.ModelTemplate({
    FK_FUNCIONARIO:     [PlataModels.Required(), PlataModels.Int()],
    FK_ESPECIALIDADE:   [PlataModels.Required(), PlataModels.Int()],
    NR_CRM:             [PlataModels.Required(), PlataModels.VarChar(20)],
    DS_UF_CRM:          [PlataModels.Required(), PlataModels.VarChar(2)],
} as const, {})

cadastrarmedico.addFilter('trim', Tools.trimModel)
export const cadastrarmedicoModel = cadastrarmedico
