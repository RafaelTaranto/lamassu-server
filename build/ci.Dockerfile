FROM node:22-alpine AS build-ui
RUN apk add --no-cache npm git curl build-base python3

COPY ["packages/admin-ui/package.json", "packages/admin-ui/package-lock.json", "./"]

RUN npm version --allow-same-version --git-tag-version false --commit-hooks false 1.0.0
RUN npm install

COPY packages/admin-ui/ ./
RUN npm run build

FROM ubuntu:20.04 as base

ARG VERSION
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Lisbon

RUN apt-get update

RUN apt-get install -y -q curl \
                          sudo \
                          git \
                          python2-minimal \
                          build-essential \
                          libpq-dev \
                          net-tools \
                          tar

RUN curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
RUN apt-get install nodejs -y -q

WORKDIR lamassu-server

COPY ["packages/server/package.json", "packages/server/package-lock.json", "./"]
RUN npm version --allow-same-version --git-tag-version false --commit-hooks false 1.0.0
RUN npm install --production

COPY ./packages/server/ ./
COPY --from=build-ui /build /lamassu-server/public

RUN cd .. && tar -zcvf lamassu-server.tar.gz ./lamassu-server