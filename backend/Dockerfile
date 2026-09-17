FROM node:20-alpine AS base
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
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 backend

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate \
  && chown -R backend:nodejs /app

COPY --from=builder --chown=backend:nodejs /app/dist ./dist

USER backend
EXPOSE 3001

# Coolify may inject PORT=3000 from shared env — force 3001 for this image
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3001/health || exit 1

CMD ["sh", "-c", "PORT=3001 HOSTNAME=0.0.0.0 node dist/index.js"]
