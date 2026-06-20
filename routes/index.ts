import cors from 'cors'

export default async function (router: Router.Router): Promise<Router.Router> {
    // Plata espera handlers async (Promise<any>); cors() é um middleware Express clássico (sync/void).
    router.use(cors() as any)

    return router
}
