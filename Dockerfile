FROM oven/bun:1

WORKDIR /app

# Copy everything
COPY . .

# Install all deps
RUN bun install

# Build web frontend
WORKDIR /app/packages/web
RUN bun run build

# Start server
EXPOSE 10000
CMD ["bun", "run", "start"]
