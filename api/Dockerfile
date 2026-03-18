# =============================================================
# Dockerfile — Next.js API
# Build multi-etapa: separa instalación, compilación y ejecución
# para que la imagen final sea lo más pequeña posible.
# =============================================================

# ─── ETAPA 1: deps ───────────────────────────────────────────
# Solo instala las dependencias de node_modules.
# Si package.json no cambia, Docker reutiliza esta capa en caché
# y no vuelve a ejecutar npm ci (mucho más rápido en re-builds).
FROM node:20-alpine AS deps

WORKDIR /app

# Copiamos primero solo los archivos de dependencias
COPY package.json package-lock.json* ./

# npm ci = instalación limpia y reproducible (usa package-lock.json)
RUN npm ci


# ─── ETAPA 2: builder ────────────────────────────────────────
# Compila la aplicación Next.js en modo producción.
FROM node:20-alpine AS builder

WORKDIR /app

# Traemos node_modules de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiamos el resto del código fuente
COPY . .

# Compilamos Next.js
# next.config.js debe tener output: 'standalone' para que el build
# genere un servidor Node.js autónomo que no depende de node_modules completo.
RUN npm run build


# ─── ETAPA 3: runner ─────────────────────────────────────────
# Imagen final: solo lo necesario para ejecutar la app.
# Esta es la imagen que Docker Compose usará en producción.
FROM node:20-alpine AS runner

WORKDIR /app

# Buenas prácticas de seguridad: no correr como root dentro del contenedor
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

ENV NODE_ENV=production
# Deshabilita telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Copiamos solo los archivos que Next.js standalone genera:
# server.js + .next/standalone + archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiamos al usuario sin privilegios
USER nextjs

# Puerto que expone el contenedor (debe coincidir con docker-compose.yml)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicio: el servidor standalone generado por Next.js
CMD ["node", "server.js"]
