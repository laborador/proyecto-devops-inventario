-- =============================================================
-- postgres/init.sql
-- Script de inicialización de la base de datos.
--
-- Docker ejecuta este archivo AUTOMÁTICAMENTE la primera vez
-- que arranca el contenedor con un volumen vacío.
-- (Gracias al mapeo en docker-compose.yml:
--  ./postgres/init.sql → /docker-entrypoint-initdb.d/init.sql)
--
-- Si el volumen ya tiene datos (segunda vez que arrancas),
-- este script NO se vuelve a ejecutar.
-- =============================================================

-- Tabla principal de productos del inventario
CREATE TABLE IF NOT EXISTS productos (
  id          SERIAL PRIMARY KEY,            -- ID autoincrementable
  nombre      VARCHAR(150)  NOT NULL,        -- Nombre del producto
  descripcion TEXT,                          -- Descripción opcional
  cantidad    INTEGER       NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  precio      NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (precio >= 0),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índice en nombre para acelerar búsquedas por texto
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos (nombre);

-- ─── Datos de ejemplo (opcional, útil para probar la API) ───
INSERT INTO productos (nombre, descripcion, cantidad, precio) VALUES
  ('Laptop HP 15',     'Laptop 15 pulgadas, 8GB RAM, 256GB SSD', 10,  799.99),
  ('Mouse Logitech',   'Mouse inalámbrico ergonómico',            50,   29.99),
  ('Teclado Mecánico', 'Teclado mecánico con switches azules',    25,   89.99),
  ('Monitor 24"',      'Monitor Full HD 75Hz',                     8,  219.99),
  ('Webcam HD',        'Cámara web 1080p con micrófono',          15,   59.99);
