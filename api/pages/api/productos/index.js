// pages/api/productos/index.js - Endpoints GET (listar) y POST (crear)
import { getAll, query } from '../../../lib/db';

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Listar todos los productos con paginación
    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Obtener total de registros
      const countResult = await query('SELECT COUNT(*) as total FROM productos');
      const total = countResult.rows[0].total;

      // Obtener productos paginados
      const productos = await getAll(
        `SELECT * FROM productos 
         ORDER BY fecha_creacion DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return res.status(200).json({
        success: true,
        data: productos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // POST - Crear nuevo producto
    if (req.method === 'POST') {
      const { nombre, descripcion, cantidad, precio, categoria, sku } = req.body;

      // Validar campos requeridos
      if (!nombre || !precio) {
        return res.status(400).json({
          success: false,
          error: 'nombre y precio son requeridos',
        });
      }

      const result = await query(
        `INSERT INTO productos (nombre, descripcion, cantidad, precio, categoria, sku, estado)
         VALUES ($1, $2, $3, $4, $5, $6, 'activo')
         RETURNING *`,
        [nombre, descripcion || null, cantidad || 0, precio, categoria || null, sku || null]
      );

      return res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: result.rows[0],
      });
    }

    // Método no permitido
    return res.status(405).json({
      success: false,
      error: 'Método no permitido',
    });
  } catch (error) {
    console.error('Error en API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
}
