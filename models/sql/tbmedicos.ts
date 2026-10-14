import { PlataModels } from 'pwi-plata-type'

const tbmedicos = new PlataModels.ModelTemplate({
    PK_ID:              [PlataModels.Required(), PlataModels.Int()],
    FK_FUNCIONARIO:     [PlataModels.Required(), PlataModels.Int()],
    FK_ESPECIALIDADE:   [PlataModels.Required(), PlataModels.Int()],
    NR_CRM:             [PlataModels.Required(), PlataModels.VarChar(20)],
    DS_UF_CRM:          [PlataModels.Required(), PlataModels.VarChar(2)],
    FL_ATIVO:           [PlataModels.Required(), PlataModels.Boolean()],
} as const, {})

export const tbmedicosModel = tbmedicos

export const TB_MEDICOS = 'TB_MEDICOS'
