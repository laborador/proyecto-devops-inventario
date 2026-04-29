# ========================================
# STAGE 1: BUILDER (Construcción)
# ========================================
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app
<<<<<<< HEAD
# Copiamos primero solo los archivos de dependencias
COPY package.json package-lock.json* ./
=======

# Copiar archivos de dependencias
COPY package*.json ./
>>>>>>> e2f924cd5ec58efed17623987c172fb001d2a5ce

# Instalar dependencias (solo las necesarias para producción)
RUN npm ci

<<<<<<< HEAD


# ─── ETAPA 2: builder ────────────────────────────────────────
# Compila la aplicación Next.js en modo producción.
FROM node:20-alpine AS builder

WORKDIR /app

# Traemos node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiamos el resto del código fuente
COPY . .

# Si el proyecto no trae carpeta public, la creamos para que el COPY
# de la etapa runner no falle.
RUN mkdir -p public

# Compilamos Next.js
# next.config.js debe tener output: 'standalone' para que el build
# genere un servidor Node.js autónomo que no depende de node_modules completo.
=======
# Copiar código fuente
COPY . .

# Construir la aplicación Next.js
>>>>>>> e2f924cd5ec58efed17623987c172fb001d2a5ce
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
