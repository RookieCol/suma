FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# Install deps for the full workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# Build web app
COPY packages/ packages/
COPY apps/web/ apps/web/
RUN pnpm --filter @grantextil/web build

# Build API
COPY apps/api/ apps/api/
RUN pnpm --filter @grantextil/api build

# Runtime image
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/apps/api/dist        ./dist
COPY --from=base /app/node_modules         ./node_modules
COPY --from=base /app/apps/api/package.json ./package.json
COPY --from=base /app/apps/web/dist        ./public
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
