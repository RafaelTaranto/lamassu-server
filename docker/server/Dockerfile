FROM node:14.16.0-alpine3.13 as builder

ENV NODE_ENV=production
WORKDIR /app-builder
RUN apk update && apk upgrade && apk add --no-cache bash git openssh postgresql-dev python3 alpine-sdk 
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production


FROM node:14.16.0-alpine3.13
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app-builder .
COPY ./lib ./lib
COPY ./bin ./bin

VOLUME /etc/lamassu
VOLUME /app/certs

#CMD [ "ls", "./" ]
CMD [ "node", "./bin/lamassu-server --mockSms" ]

EXPOSE 3000