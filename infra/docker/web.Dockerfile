# syntax=docker/dockerfile:1
# Interface web OpenTask : fichiers statiques servis par nginx, qui relaie /api vers l’API.
#   docker build -f infra/docker/web.Dockerfile -t opentask-web .
FROM node:24-alpine AS build
RUN npm install -g pnpm@12.3.4
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# Lien « Code source » affiché dans l’interface (AGPL-3.0, article 13).
ARG SOURCE_URL=""
ENV VITE_SOURCE_URL=$SOURCE_URL
RUN pnpm --filter @opentask/web build

FROM nginx:1.29-alpine AS runtime
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/build/client /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
