// app/api/productos/route.ts
// ─────────────────────────────────────────────────────────────
// Rutas CRUD para la entidad "productos" del inventario.
//
//   GET    /api/productos          → listar todos
//   POST   /api/productos          → crear uno nuevo
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// ── GET /api/productos ────────────────────────────────────────
export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM productos ORDER BY id ASC'
    )
    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    console.error('[GET /api/productos]', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

// ── POST /api/productos ───────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, cantidad, precio } = body

    // Validación básica de campos requeridos
    if (!nombre || cantidad === undefined || precio === undefined) {
      return NextResponse.json(
        { error: 'nombre, cantidad y precio son requeridos' },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, descripcion, cantidad, precio)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre, descripcion ?? null, cantidad, precio]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('[POST /api/productos]', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
