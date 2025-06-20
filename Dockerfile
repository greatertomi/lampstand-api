FROM node:20-alpine as base

WORKDIR '/app'

COPY package.json yarn.lock ./

RUN yarn install

COPY src ./src
COPY tsconfig.json ./

RUN yarn run build

FROM base as production

ENV NODE_PATH=./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

CMD ["yarn", "start"]
