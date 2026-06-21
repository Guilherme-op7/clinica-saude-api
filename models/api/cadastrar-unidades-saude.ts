
import { PlataModels } from 'pwi-plata-type'

const cadastrarunidadessaude = new PlataModels.ModelTemplate({
    DS_UNIDADE:      [PlataModels.Required(), PlataModels.VarChar()],
    DS_ENDERECO:     [PlataModels.Required(), PlataModels.VarChar()],
    DS_TELEFONE:     [PlataModels.Required(), PlataModels.VarChar()]
} as const, {})

export const cadastrarunidadessaudeModel = cadastrarunidadessaude
