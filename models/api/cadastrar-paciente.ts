import { Tools } from '@@/libs/tools'
import { PlataModels } from 'pwi-plata-type'

const cadastrarpaciente = new PlataModels.ModelTemplate({
    DS_NOME:                [PlataModels.Required(), PlataModels.VarChar(255)],
    NR_CPF:                 [PlataModels.Optional(), PlataModels.VarChar(14)],
    NR_CARTAO_SUS:          [PlataModels.Optional(), PlataModels.VarChar(30)],
    DT_NASCIMENTO:          [PlataModels.Optional(), PlataModels.SmallDateTime()],
    TP_SEXO:                [PlataModels.Optional(), PlataModels.Enum(['M', 'F', 'O'] as const)],
    DS_TELEFONE:            [PlataModels.Optional(), PlataModels.VarChar(20)],
    DS_EMAIL:               [PlataModels.Optional(), PlataModels.VarChar(100)],
    DS_ENDERECO:            [PlataModels.Optional(), PlataModels.VarChar(255)],
    DS_TIPO_SANGUINEO:      [PlataModels.Optional(), PlataModels.VarChar(5)],
    DS_ALERGIAS:            [PlataModels.Optional(), PlataModels.VarChar(500)],
    DS_CONTATO_EMERGENCIA:  [PlataModels.Optional(), PlataModels.VarChar(255)],
} as const, {})

cadastrarpaciente.addFilter('trim', Tools.trimModel)
export const cadastrarpacienteModel = cadastrarpaciente
