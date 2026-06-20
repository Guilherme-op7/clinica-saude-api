import { PlataSwagger } from 'pwi-plata-type'

// Monta a UI do Swagger em /swagger, usando os JSONs gerados por `npm run gen:swagger`
// (swagger/header.json + swagger/routes/**/{header,body,response}.json).
export default PlataSwagger.swagger
