import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>API Inventario</title>
        <meta name="description" content="API CRUD para sistema de inventarios" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>📦 API CRUD - Sistema de Inventarios</h1>
          
          <section style={{ marginBottom: '2rem' }}>
            <h2>✅ Endpoints Disponibles</h2>
            
            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
              <h3>Productos</h3>
              
              <p><strong>GET</strong> <code>/api/productos</code></p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Listar todos los productos con paginación
              </p>
              <pre style={{ background: '#fff', padding: '0.5rem', overflow: 'auto' }}>
curl http://localhost:3000/api/productos?page=1&limit=10
              </pre>

              <p><strong>POST</strong> <code>/api/productos</code></p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Crear nuevo producto
              </p>
              <pre style={{ background: '#fff', padding: '0.5rem', overflow: 'auto' }}>
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{`{"nombre":"Laptop","precio":999.99}`}'
              </pre>

              <p><strong>GET</strong> <code>/api/productos/[id]</code></p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Obtener producto por ID
              </p>

              <p><strong>PUT</strong> <code>/api/productos/[id]</code></p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Actualizar producto
              </p>

              <p><strong>DELETE</strong> <code>/api/productos/[id]</code></p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Eliminar producto
              </p>

              <hr />

              <p><strong>GET</strong> <code>/api/health</code></p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Verificar estado de la API
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>🚀 Próximos Pasos</h2>
            <ul>
              <li>Implementar autenticación JWT</li>
              <li>Agregar validaciones robustas</li>
              <li>Crear movimientos de inventario</li>
              <li>Reportes y estadísticas</li>
              <li>Dashboard frontend</li>
            </ul>
          </section>

          <section>
            <h2>📚 Documentación</h2>
            <p>Lee el <code>README.md</code> en la raíz del proyecto para más información.</p>
          </section>
        </div>
      </main>
    </>
  );
}
