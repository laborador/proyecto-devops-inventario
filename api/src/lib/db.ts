// lib/db.ts
// ─────────────────────────────────────────────────────────────
// Pool de conexiones a PostgreSQL.
// Un Pool reutiliza conexiones en lugar de abrir una nueva
// por cada request (más eficiente y resistente a picos de tráfico).
//
// La variable DATABASE_URL viene del docker-compose.yml:
//   postgresql://usuario:password@db:5432/nombre_db
//   donde "db" es el hostname del contenedor de Postgres en la red Docker.
// ─────────────────────────────────────────────────────────────
import { Pool } from 'pg'

// Reutilizamos el pool entre hot-reloads en desarrollo
// para no agotar las conexiones disponibles de Postgres.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

const pool: Pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Máximo de conexiones simultáneas al pool
    max: 10,
    // Tiempo máximo (ms) que una conexión puede estar idle antes de cerrarse
    idleTimeoutMillis: 30000,
    // Tiempo máximo (ms) de espera para obtener una conexión del pool
    connectionTimeoutMillis: 2000,
  })

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool
}

export default pool
