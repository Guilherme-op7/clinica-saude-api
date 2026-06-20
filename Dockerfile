FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY . ./

ARG BUILD_ENV
ENV BUILD_ENV=${BUILD_ENV:-docker}

RUN npm i
RUN npm run build

WORKDIR /usr/src/app/__RELEASE__

RUN npm i

FROM node:lts-alpine AS runtime

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/__RELEASE__ /usr/src/app/

CMD [ "/usr/src/app/node_modules/.bin/plata-runtime", "--skip-recompile", "+", "plata-api" ]