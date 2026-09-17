FROM node:20-alpine AS base
# Retry apk — Coolify builders sometimes hit transient Alpine CDN/DNS errors
RUN set -eux; \
  for i in 1 2 3 4 5 6 7 8 9 10; do \
    apk add --no-cache libc6-compat && break; \
    echo "apk add failed (attempt $i/10), retrying..."; \
    sleep 3; \
  done; \
  # busybox wget (from alpine base) is enough for HEALTHCHECK
  command -v wget >/dev/null

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
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

USER nextjs
EXPOSE 3000

# Coolify may inject PORT=3001 from shared env — force 3000 for this image
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["sh", "-c", "PORT=3000 HOSTNAME=0.0.0.0 node server.js"]
