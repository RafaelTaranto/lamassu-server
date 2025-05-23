FROM node:22-alpine AS base
RUN apk add --no-cache bash libpq openssl ca-certificates

WORKDIR /lamassu-server

# Copy the pre-built production package from CI (with node_modules)
COPY lamassu-server/ ./

# Install production dependencies in the container
RUN npm install --omit=dev --ignore-scripts

FROM base AS l-s
RUN chmod +x /lamassu-server/bin/lamassu-server-entrypoint.sh
EXPOSE 3000
ENTRYPOINT [ "/lamassu-server/bin/lamassu-server-entrypoint.sh" ]

FROM base AS l-a-s  
RUN chmod +x /lamassu-server/bin/lamassu-admin-server-entrypoint.sh
EXPOSE 443
ENTRYPOINT [ "/lamassu-server/bin/lamassu-admin-server-entrypoint.sh" ]