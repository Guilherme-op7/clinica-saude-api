
import { Tools } from '@@/libs/tools'
import { PlataModels } from 'pwi-plata-type'

const cadastrarfuncionario = new PlataModels.ModelTemplate({
    DS_NOME:           [PlataModels.Required(), PlataModels.VarChar()],
    NR_CPF:            [PlataModels.Required(), PlataModels.VarChar()],
    DS_DEPARTAMENTO:   [PlataModels.Required(), PlataModels.VarChar()],
    DS_CARGO:          [PlataModels.Required(), PlataModels.VarChar()],
    VL_SALARIO:        [PlataModels.Required(), PlataModels.Decimal(10, 2)],
    DS_EMAIL:          [PlataModels.Required(), PlataModels.VarChar()],
    DS_TELEFONE:       [PlataModels.Required(), PlataModels.VarChar()],
    FL_ATIVO:          [PlataModels.Optional(), PlataModels.Boolean()],
    DT_ADMISSAO:       [PlataModels.Required(), PlataModels.SmallDateTime()],
    DT_DEMISSAO:       [PlataModels.Optional(), PlataModels.SmallDateTime()],
} as const, {})

cadastrarfuncionario.addFilter('trim', Tools.trimModel)
export const cadastrarfuncionarioModel = cadastrarfuncionario
