# ----------------------------------------------------
# 1. Install dependencies stage
# ----------------------------------------------------
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock* bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# ----------------------------------------------------
# 2. Build stage
# ----------------------------------------------------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build phase
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Support build-time environment variables for Next.js (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_BASE_URL=""
ARG NEXT_PUBLIC_BASE_URL_TOKO="https://bulky.id"
ARG NEXT_PUBLIC_BASE_API_URL=""
ARG NEXT_PUBLIC_COOKIES_KEY="ACCESS_TOKEN"

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL_TOKO=$NEXT_PUBLIC_BASE_URL_TOKO
ENV NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL
ENV NEXT_PUBLIC_COOKIES_KEY=$NEXT_PUBLIC_COOKIES_KEY

# Build standalone Next.js bundle
RUN bun run build

# ----------------------------------------------------
# 3. Production runner stage (Minimal Alpine Node.js)
# ----------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Setup non-root user for security
RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nextjs

# Copy static assets and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]
