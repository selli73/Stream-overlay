# Stage 1
FROM oven/bun:1.3.14 AS install
WORKDIR /usr/src/app
COPY package.json bun.lock ./

# Stage 2
FROM install AS prerelease
RUN bun install
COPY . .
RUN bun run build

# Stage 3
FROM nginx:alpine AS release
COPY --from=prerelease /usr/src/app/dist ./usr/share/nginx/html
COPY --from=prerelease /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]