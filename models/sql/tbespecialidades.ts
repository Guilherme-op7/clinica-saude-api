import { PlataModels } from 'pwi-plata-type'

const tbespecialidades = new PlataModels.ModelTemplate({
    PK_ID:              [PlataModels.Required(), PlataModels.Int()],
    DS_ESPECIALIDADE:   [PlataModels.Required(), PlataModels.VarChar()],
    VL_CONSULTA:        [PlataModels.Required(), PlataModels.Int()],
    DS_COR:             [PlataModels.Optional(), PlataModels.VarChar()]
} as const, {})

export const tbespecialidadesModel = tbespecialidades

export const TB_ESPECIALIDADES = 'TB_ESPECIALIDADES'