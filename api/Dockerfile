# ========================================
# STAGE 1: BUILDER (Construcción)
# ========================================
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (solo las necesarias para producción)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# ========================================
# STAGE 2: RUNTIME (Ejecución)
# ========================================
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Copiar solo los archivos necesarios del stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Exponer puerto (3000 es el default de Next.js)
EXPOSE 3000

# Health check (verifica que la API esté viva)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar
CMD ["npm", "start"]
