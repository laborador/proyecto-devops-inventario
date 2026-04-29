# 📦 Sistema de Inventarios con Docker Compose

> Proyecto base con Docker para orquestar una API Next.js + PostgreSQL en tu VPS de Digital Ocean

---

## 🎯 ¿Qué es Docker Compose?

Docker Compose es una herramienta que permite **orquestar múltiples contenedores** mediante un archivo YAML. En lugar de correr comandos largos, defines todo en `docker-compose.yml` y se sincroniza automáticamente.

### Sin Docker Compose (tedioso):
```bash
docker run -d --name db postgres:15 -e POSTGRES_PASSWORD=pass
docker run -d --name api -p 3000:3000 --link db my-api
```

### Con Docker Compose (simple):
```bash
docker-compose up
```

---

## 📂 Estructura del Proyecto

```
proyecto-devops-inventario/
├── docker-compose.yml          # Orquestación de servicios
├── .env.example                # Variables de entorno (ejemplo)
├── .env                        # Variables de entorno (local, NO publicar)
├── api/
│   ├── Dockerfile              # Construcción de imagen Next.js
│   ├── package.json            # Dependencias Node.js
│   ├── pages/
│   │   ├── api/
│   │   │   └── productos/      # Rutas API (CRUD)
│   │   └── index.js
│   ├── public/
│   └── .next/                  # Build output (se genera automático)
├── postgres/
│   └── init.sql                # Script SQL inicial
└── README.md                   # Este archivo
```

---

## 🚀 Instalación y Uso

### Paso 1: Clonar/Descargar el Proyecto

```bash
cd /root/proyecto-devops-inventario
```

### Paso 2: Configurar Variables de Entorno

1. Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Editar `.env` con **valores seguros** para producción:
```bash
nano .env
```

**Valores importantes:**
- `DB_PASSWORD`: Contraseña fuerte (mín 12 caracteres)
- `JWT_SECRET`: Token secreto único
- `API_URL`: Tu dominio en Digital Ocean

> ⚠️ **IMPORTANTE**: Nunca publiques `.env` en Git. Ya está en `.gitignore`

### Paso 3: Levantar los Servicios

```bash
# Ver todos los servicios
docker-compose ps

# Iniciar los contenedores
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f api

# Ver logs de un servicio específico
docker-compose logs postgres
```

### Paso 4: Verificar que Todo Funcione

1. **PostgreSQL está corriendo:**
```bash
docker-compose exec postgres psql -U inventario_user -d inventario_db -c "SELECT * FROM productos;"
```

2. **API está disponible:**
```bash
curl http://localhost:3000/api/productos
```

---

## 💻 Cómo Funciona docker-compose.yml

### Sección `volumes`
```yaml
volumes:
  postgres_data:
    driver: local
```
**¿Qué hace?** Crea un volumen nombrado donde PostgreSQL guarda los datos de forma **persistente**. Si el contenedor muere, los datos quedan salvos.

### Sección `networks`
```yaml
networks:
  inventario_network:
    driver: bridge
```
**¿Qué hace?** Crea una red interna para que los contenedores se comuniquen entre sí. Los servicios se llaman por su nombre (`postgres`, `api`), no por IP.

### Servicio PostgreSQL

```yaml
postgres:
  image: postgres:15-alpine        # Imagen oficial de PostgreSQL
  container_name: inventario_db    # Nombre del contenedor
  environment:                     # Variables de entorno
    POSTGRES_USER: ${DB_USER}      # Lido del .env
    POSTGRES_PASSWORD: ${DB_PASSWORD}
    POSTGRES_DB: ${DB_NAME}
  volumes:
    - postgres_data:/var/lib/postgresql/data  # Datos persistentes
    - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql  # Script inicial
  ports:
    - "5432:5432"                  # Expone puerto para conexiones externas
  depends_on: []                   # Ninguna dependencia
```

**Flujo:**
1. Se descarga la imagen `postgres:15-alpine`
2. Se crea un contenedor con nombre `inventario_db`
3. Se ejecuta `postgres/init.sql` automáticamente
4. La BD queda accesible en `postgres:5432` (interno) o `localhost:5432` (externo)

### Servicio API (Next.js)

```yaml
api:
  build:
    context: ./api
    dockerfile: Dockerfile         # Construye imagen desde Dockerfile local
  environment:
    DATABASE_URL: postgresql://...  # URL de conexión a BD
  volumes:
    - ./api:/app                   # Monta código en vivo (hot reload)
  depends_on:
    postgres:
      condition: service_started   # Espera a que postgres esté listo
```

**Flujo:**
1. Lee el `Dockerfile` en `./api`
2. Construye une imagen personalizada con tu código
3. Crea un contenedor `inventario_api`
4. Monta la carpeta `./api` (cambios en vivo durante desarrollo)
5. Inicia la API en puerto `3000`

---

## 🔌 Cómo Conectan los Contenedores

### Diagrama de Comunicación

```
┌─────────────────────────────────────────────────────┐
│         Tu VPS en Digital Ocean                     │
│  ┌─────────────────────────────────────────────┐   │
│  │    Red: inventario_network (bridge)         │   │
│  │                                             │   │
│  │  ┌──────────────────┐  ┌─────────────────┐ │   │
│  │  │  postgres:5432   │  │   api:3000      │ │   │
│  │  │                  │  │                 │ │   │
│  │  │  PostgreSQL 15   │◄─┤  Next.js        │ │   │
│  │  │  BD: inventario  │  │  CRUD + Routes  │ │   │
│  │  │                  │  │                 │ │   │
│  │  └──────────────────┘  └─────────────────┘ │   │
│  │                          ▲                  │   │
│  │                          │                  │   │
│  └──────────────────────────┼──────────────────┘   │
│                             │                      │
│                       localhost:3000               │
│                      (tu navegador)                │
└─────────────────────────────────────────────────────┘
```

### Strings de Conexión

**Desde dentro del contenedor API (Docker):**
```
DATABASE_URL=postgresql://inventario_user:password@postgres:5432/inventario_db
                                               ▲
                                        nombre del servicio
```

**Desde tu máquina local (fuera de Docker):**
```
DATABASE_URL=postgresql://inventario_user:password@localhost:5432/inventario_db
                                               ▲
                                            IP local
```

---

## 📝 Dockerfile Explicado (Multi-stage Build)

El `Dockerfile` usa un patrón de **dos etapas** para optimizar el tamaño:

```dockerfile
# STAGE 1: BUILDER - Construye la app (pesado)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # Instala ALL dependencias (dev + prod)
COPY . .
RUN npm run build             # Compila Next.js

# STAGE 2: RUNTIME - Ejecuta la app (ligero)
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
# Solo copia lo necesario del stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
```

**Ventaja:** Descarta las dependencias de desarrollo (npm, buildtools) en la imagen final. La imagen de producción pesa ~150MB en lugar de 800MB.

---

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar en background
docker-compose up -d

# Parar los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO! Pierde datos)
docker-compose down -v

# Reiniciar un servicio
docker-compose restart api

# Reconstruir imagen de la API
docker-compose up --build api
```

### Logs y Monitoreo

```bash
# Ver logs de todos los servicios
docker-compose logs

# Seguir logs en vivo
docker-compose logs -f

# Logs de un servicio específico (últimas 100 líneas)
docker-compose logs --tail=100 api

# Estadísticas en tiempo real
docker stats
```

### Acceso a Contenedores

```bash
# Terminal interactiva en la API
docker-compose exec api sh

# Ejecutar comando en PostgreSQL
docker-compose exec postgres psql -U inventario_user -d inventario_db

# Ver procesos en un contenedor
docker-compose exec api ps aux
```

### Base de Datos

```bash
# Conectarse a PostgreSQL
docker-compose exec postgres psql -U inventario_user -d inventario_db

# Ver tablas
\dt

# Ver datos
SELECT * FROM productos;

# Salir
\q
```

---

## 🐛 Troubleshooting

### "Connection refused" (API no conecta a BD)

```bash
# Revisados datos de conexión en .env:
DB_USER=inventario_user
DB_PASSWORD=tu_contraseña
DB_NAME=inventario_db

# Reiniciar
docker-compose restart
```

### Puerto 3000 ya en uso

```bash
# Ver qué ocupa el puerto
lsof -i :3000

# Cambiar puerto en docker-compose.yml
# De: "3000:3000"
# A:  "3001:3000"  (localhost:3001 -> contenedor:3000)
```

### Volumen de PostgreSQL corrupto

```bash
# Eliminar todo (incluye datos)
docker-compose down -v

# Reiniciar limpio
docker-compose up -d
```

### Ver logs de error

```bash
docker-compose logs api | grep -i error
docker-compose logs postgres | grep -i error
```

---

## 📊 Monitoreo y Limpieza

```bash
# Ver tamaño de imágenes
docker images --sizes

# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes sin usar
docker image prune

# Limpiar volúmenes sin usar
docker volume prune

# Limpiar TODO (imágenes, contenedores, volúmenes, redes)
docker system prune -a --volumes
```

---

## 🚀 Deployment en Digital Ocean

### Paso 1: Preparar en tu VPS

```bash
# SSH a tu VPS
ssh root@tu_ip_vps

# Clonar el repo
git clone https://github.com/tu_usuario/proyecto-devops-inventario.git
cd proyecto-devops-inventario

# Copiar .env
cp .env.example .env

# Editar con valores seguros
nano .env
```

### Paso 2: Configurar Swap (Opcional pero Recomendado)

```bash
# Crear 2GB de swap para evitar que se quede sin memoria
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### Paso 3: Levantar en Producción

```bash
# Cambiar NODE_ENV a production en .env
sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env

# Iniciar
docker-compose up -d

# Verificar
docker-compose ps
```

### Paso 4: Configurar Reverse Proxy (Nginx)

```bash
# Instalar Nginx
apt update && apt install -y nginx

# Crear config
nano /etc/nginx/sites-available/inventario
```

```nginx
server {
    listen 80;
    server_name tu_dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar config
ln -s /etc/nginx/sites-available/inventario /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Paso 5: SSL con Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tu_dominio.com
```

---

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Official Image](https://hub.docker.com/_/postgres)
- [Next.js Deployment](https://nextjs.org/docs/deployment/docker)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 💡 Siguientes Pasos

1. ✅ Crear estructura Base (YA HECHO)
2. 🔜 Crear rutas API en `api/pages/api/productos/`
3. 🔜 Implementar autenticación JWT
4. 🔜 Agregar validaciones de datos
5. 🔜 Crear dashboard frontend
6. 🔜 Configurar CI/CD (GitHub Actions)
7. 🔜 Setup de backups automáticos

---

**¿Preguntas? Consulta los logs:**
```bash
docker-compose logs -f
```

**Mantén tu .env seguro y nunca lo publiques en Git.** 🔐

---

## ⚙️ Pipeline de CI/CD

### ¿Qué hace el pipeline?

El archivo `.gitlab-ci.yml` define un pipeline de integración continua con 3 stages que corren automáticamente en cada push:

| Stage | Job | Descripción |
|-------|-----|-------------|
| `lint` | lint | Analiza el código con ESLint para detectar errores de sintaxis y estilo |
| `build` | build | Compila el proyecto Next.js en modo producción |
| `test` | test | Verifica que la API responda correctamente en el servidor |

### ¿Cómo se activa?

El pipeline se dispara automáticamente ante cualquier `push` a la rama `main` o al abrir un `merge request`. No requiere activación manual.

### Flujo del pipelinepush a main
│
▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│  lint   │────▶│  build  │────▶│  test   │
└─────────┘     └─────────┘     └─────────┘### Variables de entorno

Las credenciales sensibles (usuario y contraseña de base de datos) se manejan como **variables protegidas de GitLab** y nunca se escriben directamente en el código ni en el `.gitlab-ci.yml`.

### Estado del pipeline

El estado (éxito o fallo) es visible en **GitLab → Build → Pipelines**.
EOFcd ~/proyecto-devops-inventario-1
git add README.md
git commit -m "docs: agregar sección del pipeline de CI al README"
git push gitlab main
cat >> ~/proyecto-devops-inventario-1/README.md << 'EOF'

---

## ⚙️ Pipeline de CI/CD

### ¿Qué hace el pipeline?

El archivo `.gitlab-ci.yml` define un pipeline de integración continua con 3 stages que corren automáticamente en cada push:

| Stage | Job | Descripción |
|-------|-----|-------------|
| `lint` | lint | Analiza el código con ESLint para detectar errores de sintaxis y estilo |
| `build` | build | Compila el proyecto Next.js en modo producción |
| `test` | test | Verifica que la API responda correctamente en el servidor |

### ¿Cómo se activa?

El pipeline se dispara automáticamente ante cualquier `push` a la rama `main` o al abrir un `merge request`. No requiere activación manual.

### Flujo del pipelinepush a main
│
▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│  lint   │────▶│  build  │────▶│  test   │
└─────────┘     └─────────┘     └─────────┘### Variables de entorno

Las credenciales sensibles (usuario y contraseña de base de datos) se manejan como **variables protegidas de GitLab** y nunca se escriben directamente en el código ni en el `.gitlab-ci.yml`.

### Estado del pipeline

El estado (éxito o fallo) es visible en **GitLab → Build → Pipelines**.
