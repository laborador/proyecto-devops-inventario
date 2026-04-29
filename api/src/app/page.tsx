import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let productos: any[] = [];
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query('SELECT * FROM productos ORDER BY id');
    productos = result.rows;
    await pool.end();
  } catch (e) {
    console.error('DB error:', e);
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", background: "#f4f4f4", minHeight: "100vh" }}>
      <h1 style={{ color: "#1e3a5f" }}>📦 Sistema de Inventario</h1>
      <p style={{ color: "#555" }}>{productos.length} productos registrados</p>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr>
            {["#","Nombre","Descripción","Cantidad","Precio"].map(h => (
              <th key={h} style={{ background: "#2563eb", color: "white", padding: "12px 16px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map((p: any) => (
            <tr key={p.id}>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>{p.id}</td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>{p.nombre}</td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>{p.descripcion}</td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>{p.cantidad}</td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>${p.precio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
