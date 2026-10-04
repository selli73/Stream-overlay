# Stage 1
FROM oven/bun:1.3.14 AS base
WORKDIR /usr/src/app

# Stage 2
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Stage 3
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ARG DATABASE_URL="postgresql://user:password@localhost:5432/db"
RUN bunx prisma generate
RUN bun run build

# Stage 4
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/package.json .

COPY --from=prerelease /usr/src/app/prisma ./prisma
COPY --from=prerelease /usr/src/app/prisma.config.ts .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["sh", "-c", "bunx prisma migrate deploy && exec bun run start:prod"]