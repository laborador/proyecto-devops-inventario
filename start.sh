#!/bin/bash
# Script para empezar con el proyecto

echo "🚀 Iniciando Sistema de Inventarios con Docker Compose..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instálalo desde https://www.docker.com"
    exit 1
fi

# Copiar .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Edita .env con contraseñas seguras antes de producción"
fi

# Crear volumen de datos si no existe
if ! docker volume ls | grep -q "postgres_data"; then
    echo "📦 Creando volumen para PostgreSQL..."
    docker volume create postgres_data
fi

# Construir e iniciar servicios
echo "🐳 Levantando contenedores..."
docker-compose up -d --build

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar estado
echo ""
echo "📊 Estado de servicios:"
docker-compose ps

echo ""
echo "✅ Sistema iniciado exitosamente!"
echo ""
echo "📍 Accede a:"
echo "   API: http://localhost:3000"
echo "   PostgreSQL: localhost:5432"
echo ""
echo "🔍 Para ver logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para parar:"
echo "   docker-compose down"
