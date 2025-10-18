FROM node:20-alpine AS base

ENV NODE_ENV=production
WORKDIR /app

# ---------- Builder base with pnpm ----------
FROM base AS builder-base

ENV TURBO_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# ---------- Pruner ----------
FROM builder-base AS pruner
RUN apk update && apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY . .
RUN pnpm install --global turbo@^2
RUN turbo prune backend --docker

# ---------- Installer ----------
FROM builder-base AS installer
RUN apk update && apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/full/ .
RUN pnpm install --prefer-frozen-lockfile

# Generate Prisma client and build backend
RUN pnpm --filter @workspace/db run prisma:generate
RUN pnpm --filter @workspace/db build && mkdir -p packages/db/dist/generated && cp -r packages/db/src/generated/prisma packages/db/dist/generated/prisma
RUN pnpm --filter=backend build
RUN mkdir -p /app/deploy && pnpm deploy /app/deploy --filter backend --prod --legacy

# ---------- Runner ----------
FROM base AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 backend

# Copy minimal deployable artifact
COPY --from=installer --chown=backend:nodejs /app/deploy/ ./

USER backend
EXPOSE 8000

ENV PORT=8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --spider http://localhost:8000/health || exit 1

CMD ["node", "dist/index.js"]