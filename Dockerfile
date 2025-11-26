FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm build && pnpm export

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



