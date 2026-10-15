# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN npm install -g pnpm@12.3.4
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @opentask/mcp build
RUN pnpm --filter @opentask/mcp --config.public-hoist-pattern='*' deploy --prod --legacy /out \
 && cp -r apps/mcp/dist /out/dist

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S opentask && adduser -S opentask -G opentask
COPY --from=build --chown=opentask:opentask /out ./
USER opentask
EXPOSE 4100
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4100/health || exit 1
CMD ["node", "dist/http.js"]
