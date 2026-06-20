import { getJWT } from '@@/libs/jwt'
import { TbUsuarios } from '@@/libs/sql/tbusuarios'
import { cadastroModel } from '@@/models/api/cadastro'

export default async function (router: Router.Router): Promise<Router.Router> {
    const jwt = getJWT<TApi.Token>()

    router.post('/', async (req, res) => {
        const sql = req.extras

        const dados = await cadastroModel.validate(req.body)

        if (dados.errors !== undefined) {
            return res.status(400).error({
                errorID: 'BR1AUCAD001',
                msg: 'Erro ao validar os dados de cadastro',
                error: dados.errors
            })
        }

        const cadastro = await TbUsuarios.CadastrarPaciente(dados.value, sql)

        if (cadastro.errorID !== undefined) {
            return res.status(400).error(cadastro)
        }

        const token = jwt.create({
            type: 'PACIENTE',
            idUsuario: cadastro.idUsuario,
            nome: dados.value.NOME,
            email: dados.value.EMAIL,
            fkPaciente: cadastro.idPaciente,
        } satisfies TApi.TokenPaciente)

        return res.status(201).json({ token })
    })

    return router
}
