
import { PlataModels } from 'pwi-plata-type'

const tbfuncionarios = new PlataModels.ModelTemplate({
    PK_ID:           [PlataModels.Required(), PlataModels.Int()],
    DS_NOME:         [PlataModels.Required(), PlataModels.VarChar()],
    NR_CPF:          [PlataModels.Required(), PlataModels.VarChar()],
    DS_DEPARTAMENTO: [PlataModels.Optional(), PlataModels.VarChar()],
    DS_CARGO:        [PlataModels.Optional(), PlataModels.VarChar()],
    VL_SALARIO:      [PlataModels.Optional(), PlataModels.Decimal()],
    DS_EMAIL:        [PlataModels.Optional(), PlataModels.VarChar()],
    DS_TELEFONE:     [PlataModels.Optional(), PlataModels.VarChar()],
    FL_ATIVO:        [PlataModels.Optional(), PlataModels.Boolean()],
    DT_ADMISSAO:     [PlataModels.Required(), PlataModels.DateTime()],
    DT_DEMISSAO:     [PlataModels.Optional(), PlataModels.DateTime()],
} as const, {})
export const tbfuncionariosModel = tbfuncionarios

export const TB_FUNCIONARIOS = 'TB_FUNCIONARIOS'
