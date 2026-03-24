// lib/db.js - Conexión a PostgreSQL
import { Pool } from 'pg';

// Crear pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,   // Cerrar conexión inactiva después de 30s
  connectionTimeoutMillis: 2000, // Timeout en conexión
});

// Eventos para debugging
pool.on('error', (err) => {
  console.error('Pool error:', err);
});

pool.on('connect', () => {
  console.log('✅ Conexión a PostgreSQL establecida');
});

/**
 * Ejecutar query a la BD
 * @param {string} query - SQL query
 * @param {array} params - Parámetros preparados (seguro contra SQL injection)
 * @returns {Promise} Resultado de la query
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[DB Query]', { text, duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * Ejecutar transacción
 * @param {function} callback - Función que contiene las queries
 * @returns {Promise} Resultado de la transacción
 */
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtener una fila
 * @param {string} query - SQL query
 * @param {array} params - Parámetros
 * @returns {Promise} Primera fila o null
 */
export async function getOne(text, params) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

/**
 * Obtener múltiples filas
 * @param {string} query - SQL query
 * @param {array} params - Parámetros
 * @returns {Promise} Array de filas
 */
export async function getAll(text, params) {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Desconectar el pool
 */
export async function end() {
  await pool.end();
  console.log('Pool de conexiones cerrado');
}

export default pool;
