// pages/api/health.js - Health check endpoint
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  return res.status(200).json({
    status: 'ok',
    message: 'API está funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
}
