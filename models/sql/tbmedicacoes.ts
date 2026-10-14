import { PlataModels } from 'pwi-plata-type'

const tbmedicacoes = new PlataModels.ModelTemplate({
    PK_ID:                  [PlataModels.Required(), PlataModels.Int()],
    DS_NOME:                [PlataModels.Required(), PlataModels.VarChar(150)],
    DS_PRINCIPIO_ATIVO:     [PlataModels.Optional(), PlataModels.VarChar(150)],
    DS_FABRICANTE:          [PlataModels.Optional(), PlataModels.VarChar(150)],
    DS_FORMA_FARMACEUTICA:  [PlataModels.Required(), PlataModels.VarChar(50)],
    DS_DOSAGEM:             [PlataModels.Required(), PlataModels.VarChar(50)],
    FL_CONTROLADA:          [PlataModels.Required(), PlataModels.Boolean()],
    DS_OBSERVACOES:         [PlataModels.Optional(), PlataModels.VarChar(500)],
    FL_ATIVO:               [PlataModels.Required(), PlataModels.Boolean()],
} as const, {})

export const tbmedicacoesModel = tbmedicacoes

export const TB_MEDICACOES = 'TB_MEDICACOES'
