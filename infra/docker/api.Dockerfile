# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN npm install -g pnpm@12.3.4
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate && pnpm --filter @opentask/api build
RUN pnpm --filter @opentask/api --config.public-hoist-pattern='*' deploy --prod --legacy /out \
 && cp -r apps/api/dist /out/dist \
 && pnpm --filter @opentask/database deploy --prod --legacy /out/database \
 && cd /out/database && node_modules/.bin/prisma version

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S opentask && adduser -S opentask -G opentask
COPY --from=build --chown=opentask:opentask /out ./
USER opentask
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1
CMD ["sh", "-c", "cd database && node_modules/.bin/prisma migrate deploy && cd .. && exec node dist/main.js"]
