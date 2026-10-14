import { Tools } from '@@/libs/tools'
import { PlataModels } from 'pwi-plata-type'

const cadastrarmedicacao = new PlataModels.ModelTemplate({
    DS_NOME:                [PlataModels.Required(), PlataModels.VarChar(150)],
    DS_PRINCIPIO_ATIVO:     [PlataModels.Optional(), PlataModels.VarChar(150)],
    DS_FABRICANTE:          [PlataModels.Optional(), PlataModels.VarChar(150)],
    DS_FORMA_FARMACEUTICA:  [PlataModels.Required(), PlataModels.VarChar(50)],
    DS_DOSAGEM:             [PlataModels.Required(), PlataModels.VarChar(50)],
    FL_CONTROLADA:          [PlataModels.Optional(), PlataModels.Boolean()],
    DS_OBSERVACOES:         [PlataModels.Optional(), PlataModels.VarChar(500)],
} as const, {})

cadastrarmedicacao.addFilter('trim', Tools.trimModel)
export const cadastrarmedicacaoModel = cadastrarmedicacao
