FROM node:22-alpine AS base
# Retry apk — Coolify builders sometimes hit transient Alpine CDN/DNS errors
RUN set -eux; \
  for i in 1 2 3 4 5 6 7 8 9 10; do \
    apk add --no-cache libc6-compat openssl && break; \
    echo "apk add failed (attempt $i/10), retrying..."; \
    sleep 3; \
  done; \
  command -v wget >/dev/null

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* prisma.config.ts ./
COPY prisma ./prisma
# postinstall runs `prisma generate` into lib/generated/prisma
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Do not ARG/ENV secrets (DATABASE_URL, STRIPE_*, BREVO_*). Coolify injects
# those at container runtime. Prisma is lazy so `next build` does not need them.
# Prisma generate again in case schema changed vs lockfile stage
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma 7 has no native engine: the generated client and the pg adapter are
# bundled into .next/standalone by Next's file tracing.

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["sh", "-c", "PORT=3000 HOSTNAME=0.0.0.0 node server.js"]
