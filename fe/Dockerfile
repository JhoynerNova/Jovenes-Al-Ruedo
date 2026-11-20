
# ════════════════════════════════════════════════================================================================
# ETAPA 1 — builder: compilar la aplicación React
# ════════════════════════════════════════════════
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm build

# ════════════════════════════════════════════
# ETAPA 2 — runner: servir con Nginx
# ════════════════════════════════════════════
FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
