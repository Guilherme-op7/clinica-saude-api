import { PlataModels } from 'pwi-plata-type'
import { Tools } from '@@/libs/tools'

const TbUsuarios = new PlataModels.ModelTemplate({
    PK_ID:          [PlataModels.Required(), PlataModels.Int()],
    DS_NOME:        [PlataModels.Required(), PlataModels.VarChar(100)],
    DS_EMAIL:       [PlataModels.Required(), PlataModels.VarChar(255)],
    DS_SENHA_HASH:  [PlataModels.Required(), PlataModels.VarChar(255)],
    TP_USUARIO:     [PlataModels.Optional(), PlataModels.Enum(['admin', 'recepcao', 'medico', 'paciente'] as const)],
    FK_FUNCIONARIO: [PlataModels.Optional(), PlataModels.Int()],
    FK_PACIENTE:    [PlataModels.Optional(), PlataModels.Int()],
    FL_ATIVO:       [PlataModels.Optional(), PlataModels.Boolean()],
} as const, {})

TbUsuarios.addFilter('trim', Tools.trimModel)

export const TbUsuariosModel = TbUsuarios
export const TB_USUARIOS = 'tb_usuarios'
