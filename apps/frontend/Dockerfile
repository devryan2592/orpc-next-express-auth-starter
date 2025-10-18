# Use the official Node.js 20 Alpine image as base
FROM node:20-alpine AS base

ENV NODE_ENV=production
WORKDIR /app

# Builder base stage with pnpm setup
FROM base AS builder-base

ENV TURBO_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1

RUN corepack enable pnpm && corepack prepare pnpm@9.12.0 --activate

# Pruner stage - creates a partial monorepo with only frontend dependencies
FROM builder-base AS pruner
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo globally
RUN pnpm install --global turbo@^2

# Copy the entire monorepo
COPY . .

# Generate a partial monorepo with a pruned lockfile for frontend
RUN turbo prune frontend --docker

# Installer stage - installs dependencies for the pruned workspace
FROM builder-base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --prefer-frozen-lockfile

# Build the project
COPY --from=pruner /app/out/full/ .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN pnpm --filter=frontend build

# Production stage
FROM base AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
# NOTE: CRM app does not have a `public` directory; skip copying it to avoid build failure

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Propagate public env for runtime (optional)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# Start the application
CMD ["node", "apps/frontend/server.js"]