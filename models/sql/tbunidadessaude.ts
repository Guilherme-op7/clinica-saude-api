
import { PlataModels } from 'pwi-plata-type'

const tbunidadessaude = new PlataModels.ModelTemplate({
    PK_ID:          [PlataModels.Required(), PlataModels.Int()],
    DS_UNIDADE:     [PlataModels.Required(), PlataModels.VarChar()],
    DS_ENDERECO:    [PlataModels.Optional(), PlataModels.VarChar()],
    DS_TELEFONE:    [PlataModels.Optional(),PlataModels.VarChar()]
} as const, {})

export const tbunidadessaudeModel = tbunidadessaude

export const TB_UNIDADES_SAUDE = 'TB_UNIDADES_SAUDE'
