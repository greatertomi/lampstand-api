FROM node:alpine as base

WORKDIR '/app'

COPY package*.json ./

RUN yarn install

COPY . .

FROM base as production

ENV NODE_PATH=./dist

RUN yarn run build
