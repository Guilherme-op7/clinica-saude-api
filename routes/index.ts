import cors from 'cors'

export default async function (router: Router.Router): Promise<Router.Router> {
    router.use(cors() as any)

    return router
}
