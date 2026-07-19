# =============================================
# Stage 1 : Build Angular
# =============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copier package.json d'abord (cache npm)
COPY package*.json ./
RUN npm ci --silent

# Copier sources et builder
COPY . .
RUN npm run build

# =============================================
# Stage 2 : Nginx pour servir le SPA
# =============================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Supprimer le contenu par défaut
RUN rm -rf ./*

# Copier le build Angular
COPY --from=builder /app/dist/plantverde-frontend/browser .

# Config Nginx pour Angular SPA + proxy API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
