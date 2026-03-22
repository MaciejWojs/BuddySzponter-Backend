FROM oven/bun:1.3.11-alpine AS builder

WORKDIR /BS

COPY bun.lock package.json /BS/

RUN bun install --ignore-scripts --frozen-lockfile

COPY . /BS

RUN bun run minify

FROM oven/bun:1.3.11-alpine

WORKDIR /app

RUN apk add --no-cache --virtual .run-deps curl
COPY --from=builder /BS/.dist /app/.dist
COPY --from=builder /BS/package.json /app/
# COPY --from=builder /BS/prisma /app/prisma
# COPY --from=builder /BS/prisma.config.ts /app/

EXPOSE 3000

CMD ["bun", "run", "prod"]
