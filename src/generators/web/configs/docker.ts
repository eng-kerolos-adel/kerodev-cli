// src/generators/web/configs/docker.ts

import type { WebProjectConfig } from '../../../types/index.js';

export function generateDockerFiles(config: WebProjectConfig): [string, string] {
  const isNext = config.framework === 'next';
  const pm = config.packageManager;

  const installCmd = pm === 'npm' ? 'npm ci' :
    pm === 'pnpm' ? 'pnpm install --frozen-lockfile' :
    pm === 'yarn' ? 'yarn install --frozen-lockfile' : 'bun install --frozen-lockfile';

  const buildCmd = pm === 'npm' ? 'npm run build' :
    pm === 'pnpm' ? 'pnpm build' :
    pm === 'yarn' ? 'yarn build' : 'bun run build';

  const dockerfile = `# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

${pm === 'pnpm' ? `RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./` :
  pm === 'yarn' ? 'COPY package.json yarn.lock ./' :
  pm === 'bun' ? 'COPY package.json bun.lockb ./' :
  'COPY package.json package-lock.json ./'}
RUN ${installCmd}

# ─── Stage 2: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN ${buildCmd}

# ─── Stage 3: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
${isNext ? 'ENV NEXT_TELEMETRY_DISABLED=1' : ''}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

${isNext ? `COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=appuser:nodejs /app/.next/static ./.next/static` :
`COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./`}

USER appuser

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

${isNext ? 'CMD ["node", "server.js"]' : 'CMD ["node", "dist/index.js"]'}
`;

  const compose = `version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - app-network

  # ── Optional: Uncomment to add a database ────────────────────────────────
  # db:
  #   image: postgres:16-alpine
  #   environment:
  #     POSTGRES_USER: \${DB_USER:-postgres}
  #     POSTGRES_PASSWORD: \${DB_PASSWORD:-password}
  #     POSTGRES_DB: \${DB_NAME:-appdb}
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - '5432:5432'
  #   networks:
  #     - app-network

networks:
  app-network:
    driver: bridge

# volumes:
#   postgres_data:
`;

  return [dockerfile, compose];
}
