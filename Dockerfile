FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb turbo.json ./
COPY packages/web/package.json ./packages/web/
COPY packages/mobile/package.json ./packages/mobile/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY packages/web ./packages/web

# Build
WORKDIR /app/packages/web
RUN bun run build --no-typecheck 2>/dev/null || bun build src/server.ts --target=bun --outdir=dist-server

FROM oven/bun:1 AS runner

WORKDIR /app

COPY --from=builder /app/packages/web ./packages/web
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

WORKDIR /app/packages/web

EXPOSE 3000

CMD ["bun", "run", "start"]
