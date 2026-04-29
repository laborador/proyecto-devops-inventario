# 📋 GUÍA RÁPIDA DE INICIO

## ¿Qué es Docker Compose?
Una herramienta que orquesta múltiples contenedores en un solo archivo YAML.

**Sin Docker Compose:** Correr 2 comandos largos para levantar BD y API  
**Con Docker Compose:** 1 comando simple: `docker-compose up -d`

---

## 📂 Estructura del Proyecto

```
proyecto-devops-inventario/
│
├── 📄 docker-compose.yml          ← El corazón: orquestra BD + API
├── 📄 .env.example                ← Plantilla de variables (NUNCA publicar .env)
├── 📄 .env.production             ← Ejemplo para producción
├── 📄 README.md                   ← Documentación completa
├── 📄 start.sh                    ← Script rápido para iniciar
├── 📄 test-api.sh                 ← Script para testear endpoints
│
├── 📁 api/                         ← CÓDIGO DE LA API (Next.js)
│   ├── 📄 Dockerfile              ← Cómo construir imagen Docker
│   ├── 📄 package.json            ← Dependencias Node.js
│   ├── 📄 next.config.js          ← Config de Next.js
│   ├── 📁 pages/
│   │   ├── 📄 index.js            ← Home (documentación)
│   │   └── 📁 api/
│   │       ├── 📄 health.js       ← GET /api/health
│   │       └── 📁 productos/
│   │           ├── 📄 index.js    ← GET/POST /api/productos
│   │           └── 📄 [id].js     ← GET/PUT/DELETE /api/productos/[id]
│   ├── 📁 lib/
│   │   └── 📄 db.js               ← Funciones para conectar PostgreSQL
│   └── 📁 public/                 ← Archivos estáticos
│
└── 📁 postgres/                    ← CONFIGURACIÓN DE BD
    └── 📄 init.sql                ← Script SQL inicial
```

---

## 🚀 Inicio Rápido (5 minutos)

### 1️⃣ Configurar Variables
```bash
cp .env.example .env
nano .env  # Editar contraseñas
```

### 2️⃣ Levantar Servicios
```bash
docker-compose up -d
```

**¿Qué hace?**
- Descarga imagen de PostgreSQL
- Crea volumen para datos
- Construye imagen de Next.js
- Levanta ambos contenedores en red privada
- PostgreSQL en `postgres:5432`
- API en `localhost:3000`

### 3️⃣ Verificar Que Funcione
```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Testear API
curl http://localhost:3000/api/health

# Ver datos en BD
docker-compose exec postgres psql -U inventario_user -d inventario_db -c "SELECT * FROM productos;"
```

---

## 🔧 Cómo Funciona docker-compose.yml

### Secciones principales:

1. **volumes** - Almacenamiento persistente
   ```yaml
   postgres_data:  # Volumen nombrado
   ```
   → PostgreSQL guarda datos aquí, no se pierden si el contenedor muere

2. **networks** - Red interna privada
   ```yaml
   inventario_network:
   ```
   → Los contenedores se ven entre sí usando nombres (ej: `postgres:5432`)

3. **services** - Los contenedores

   a) **postgres** - Base de datos
   ```
   image: postgres:15-alpine     # Imagen oficial de PG
   environment: ...               # Contraseña, usuario, BD
   volumes: ...                   # Almacenamiento + script SQL inicial
   ports: 5432:5432              # Expone puerto para conexión externa
   ```

   b) **api** - Aplicación Next.js
   ```
   build: ./api                   # Construye desde Dockerfile local
   environment: DATABASE_URL=...  # Cómo conectarse a PostgreSQL
   volumes: ./api:/app            # Código en vivo (hot reload)
   depends_on: postgres           # Espera a que PG esté listo
   ports: 3000:3000              # Expone puerto de la API
   ```

---

## 📡 Flujo de Comunicación

```
Tu Navegador
    │
    ▼
http://localhost:3000 (A través de Nginx en producción)
    │
    ▼
┌─────────────────────────────────────┐
│  Contenedor API (Next.js)           │
│  Puerta: 3000                       │
└──────────────┬──────────────────────┘
               │ (Dentro de Docker)
               │ usa "postgres:5432"
               ▼
┌─────────────────────────────────────┐
│  Contenedor PostgreSQL              │
│  Puerta: 5432                       │
│  Datos en: postgres_data (volumen)  │
└─────────────────────────────────────┘
```

---

## 📝 Endpoints de la API

### Health Check
```bash
GET /api/health
```
Respuesta:
```json
{
  "status": "ok",
  "message": "API está funcionando correctamente",
  "timestamp": "2024-03-14T10:30:00Z"
}
```

### Listar Productos
```bash
GET /api/productos?page=1&limit=10
```
Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Laptop Dell",
      "precio": 899.99,
      "cantidad": 5,
      "fecha_creacion": "2024-03-14T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

### Crear Producto
```bash
POST /api/productos
Content-Type: application/json

{
  "nombre": "Mouse",
  "descripcion": "Mouse inalámbrico",
  "cantidad": 25,
  "precio": 29.99,
  "categoria": "Accesorios",
  "sku": "MOUSE-001"
}
```

### Obtener Producto
```bash
GET /api/productos/1
```

### Actualizar Producto
```bash
PUT /api/productos/1
Content-Type: application/json

{
  "cantidad": 30,
  "precio": 39.99
}
```

### Eliminar Producto
```bash
DELETE /api/productos/1
```

---

## 🛑 Parar/Reiniciar

```bash
# Pausar (no elimina datos)
docker-compose stop

# Reanudar
docker-compose start

# Reiniciar
docker-compose restart

# Parar y limpiar (¡CUIDADO! Pierde datos si no haces backup)
docker-compose down -v

# Parar sin eliminar volúmenes (datos seguros)
docker-compose down
```

---

## 🐛 Problemas Comunes

### Puerto 3000 ya en uso
```bash
# Cambiar puerto en docker-compose.yml
- "3001:3000"  # Accede en localhost:3001
```

### Base de datos no se conecta
```bash
# Revisar logs de ambos servicios
docker-compose logs postgres
docker-compose logs api

# Recrear todo
docker-compose down -v
docker-compose up -d
```

### Ver variables de un contenedor
```bash
docker-compose exec api env | grep DATABASE_URL
```

---

## 📊 Monitoreo

```bash
# Uso de recursos (CPU, memoria)
docker stats

# Logs de un servicio (últimas 50 líneas, tiempo real)
docker-compose logs --tail=50 -f api

# Inspeccionar contenedor
docker inspect inventario_api
```

---

## 🚀 Próximas Características por Agregar

- [ ] Autenticación JWT
- [ ] Validaciones robustas
- [ ] Movimientos de inventario
- [ ] Reportes y estadísticas
- [ ] Dashboard React
- [ ] Backups automáticos PostgreSQL
- [ ] Tests automatizados
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo con Prometheus
- [ ] Logs centralizados con ELK

---

## 💾 Resumen de Archivos

| Archivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Define servicios, puertos, volúmenes, redes |
| `.env` | Variables locales (NO publicar) |
| `.env.example` | Plantilla de variables |
| `.env.production` | Ejemplo para producción |
| `api/Dockerfile` | Cómo construir imagen Next.js |
| `api/package.json` | Dependencias de Node.js |
| `postgres/init.sql` | Script SQL ejecutado al iniciar BD |
| `README.md` | Documentación detallada |
| `start.sh` | Script rápido para iniciar |
| `test-api.sh` | Script para testear endpoints |

---

## 📚 Aprender Más

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Node.js pg Driver](https://node-postgres.com/)

---

**¡Listo para comenzar!** 🎉  
Ejecuta: `docker-compose up -d`
