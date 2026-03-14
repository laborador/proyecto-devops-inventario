/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANTE para el Dockerfile multi-etapa:
  // Genera un servidor Node.js autónomo en .next/standalone
  // que no necesita el directorio node_modules completo para correr.
  output: 'standalone',
}

module.exports = nextConfig
