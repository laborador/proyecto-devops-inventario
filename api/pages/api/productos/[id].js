// pages/api/productos/[id].js - Endpoints GET (detalle), PUT (actualizar), DELETE
import { getOne, query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  // Validar ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'ID de producto inválido',
    });
  }

  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Obtener producto por ID
    if (req.method === 'GET') {
      const producto = await getOne(
        'SELECT * FROM productos WHERE id = $1',
        [id]
      );

      if (!producto) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        data: producto,
      });
    }

    // PUT - Actualizar producto
    if (req.method === 'PUT') {
      const { nombre, descripcion, cantidad, precio, categoria, estado } = req.body;

      // Validar que el producto existe
      const exists = await getOne(
        'SELECT id FROM productos WHERE id = $1',
        [id]
      );

      if (!exists) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
        });
      }

      // Actualizar solo los campos proporcionados
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (nombre !== undefined) {
        updates.push(`nombre = $${paramCount++}`);
        params.push(nombre);
      }
      if (descripcion !== undefined) {
        updates.push(`descripcion = $${paramCount++}`);
        params.push(descripcion);
      }
      if (cantidad !== undefined) {
        updates.push(`cantidad = $${paramCount++}`);
        params.push(cantidad);
      }
      if (precio !== undefined) {
        updates.push(`precio = $${paramCount++}`);
        params.push(precio);
      }
      if (categoria !== undefined) {
        updates.push(`categoria = $${paramCount++}`);
        params.push(categoria);
      }
      if (estado !== undefined) {
        updates.push(`estado = $${paramCount++}`);
        params.push(estado);
      }

      updates.push(`fecha_actualizacion = NOW()`);
      params.push(id);

      if (updates.length === 1) {
        return res.status(400).json({
          success: false,
          error: 'Ningún campo para actualizar',
        });
      }

      const result = await query(
        `UPDATE productos 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        params
      );

      return res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: result.rows[0],
      });
    }

    // DELETE - Eliminar producto
    if (req.method === 'DELETE') {
      const result = await query(
        'DELETE FROM productos WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente',
      });
    }

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
