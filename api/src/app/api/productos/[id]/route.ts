// app/api/productos/[id]/route.ts
// ─────────────────────────────────────────────────────────────
// Rutas CRUD para un producto específico por ID.
//
//   GET    /api/productos/:id      → obtener uno
//   PUT    /api/productos/:id      → actualizar
//   DELETE /api/productos/:id      → eliminar
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: { id: string } }

// ── GET /api/productos/:id ────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [params.id]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[GET /api/productos/:id]', error)
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}

// ── PUT /api/productos/:id ────────────────────────────────────
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { nombre, descripcion, cantidad, precio } = body

    const { rows } = await pool.query(
      `UPDATE productos
       SET nombre      = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           cantidad    = COALESCE($3, cantidad),
           precio      = COALESCE($4, precio),
           updated_at  = NOW()
       WHERE id = $5
       RETURNING *`,
      [nombre, descripcion, cantidad, precio, params.id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[PUT /api/productos/:id]', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

// ── DELETE /api/productos/:id ─────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM productos WHERE id = $1',
      [params.id]
    )
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Producto eliminado' }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/productos/:id]', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
