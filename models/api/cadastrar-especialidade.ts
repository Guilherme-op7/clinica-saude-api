import { PlataModels } from 'pwi-plata-type'
import { Tools } from '@@/libs/tools'

const cadastrarEspecialidade = new PlataModels.ModelTemplate({
    DS_ESPECIALIDADE:   [PlataModels.Required(), PlataModels.VarChar(100)],
    VL_CONSULTA:        [PlataModels.Required(), PlataModels.Int()],
    DS_COR:             [PlataModels.Optional(), PlataModels.VarChar(20)],
} as const, {})

cadastrarEspecialidade.addFilter('trim', Tools.trimModel)

export const cadastrarEspecialidadeModel = cadastrarEspecialidade
