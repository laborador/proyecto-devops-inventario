#!/bin/bash
# Script para testear los endpoints de la API

API_URL="http://localhost:3000"
PRODUCTS_ENDPOINT="$API_URL/api/productos"

echo "🧪 Testeando API de Inventarios"
echo "================================"
echo ""

# Test 1: Health check
echo "1️⃣  Health Check"
curl -s "$API_URL/api/health" | jq .
echo ""

# Test 2: Listar productos
echo "2️⃣  Listar Productos"
curl -s "$PRODUCTS_ENDPOINT" | jq .
echo ""

# Test 3: Crear producto
echo "3️⃣  Crear Nuevo Producto"
curl -s -X POST "$PRODUCTS_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Producto Test",
    "descripcion": "Especificaciones del producto",
    "cantidad": 15,
    "precio": 49.99,
    "categoria": "Test",
    "sku": "TEST-001"
  }' | jq .
echo ""

# Test 4: Obtener producto específico (asumiendo ID=1)
echo "4️⃣  Obtener Producto por ID (ID=1)"
curl -s "$PRODUCTS_ENDPOINT/1" | jq .
echo ""

# Test 5: Actualizar producto
echo "5️⃣  Actualizar Producto (ID=1)"
curl -s -X PUT "$PRODUCTS_ENDPOINT/1" \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 20,
    "precio": 59.99
  }' | jq .
echo ""

echo "✅ Tests completados"
