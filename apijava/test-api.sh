#!/bin/bash

# Script de pruebas para la API de Webpay Plus
# Este script contiene ejemplos de curl para probar todos los endpoints

API_URL="http://localhost:8080/api"
WEBPAY_URL="$API_URL/webpay"

echo "=========================================="
echo "API Webpay Plus - Script de Pruebas"
echo "=========================================="
echo ""

# 1. Health Check
echo "1. Verificar que la API está funcionando..."
echo "GET /api/health"
curl -s -X GET "$API_URL/health" | jq .
echo ""
echo ""

# 2. Información de la API
echo "2. Obtener información de la API..."
echo "GET /api/info"
curl -s -X GET "$API_URL/info" | jq .
echo ""
echo ""

# 3. Crear transacción
echo "3. Crear nueva transacción..."
echo "POST /api/webpay/create"
AMOUNT=50000
BUY_ORDER="ORD-$(date +%s%N | cut -b1-13)"
SESSION_ID="SES-$(date +%s%N | cut -b1-13)"
RETURN_URL="http://localhost:3000/callback"

CREATE_RESPONSE=$(curl -s -X POST "$WEBPAY_URL/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $AMOUNT,
    \"buyOrder\": \"$BUY_ORDER\",
    \"sessionId\": \"$SESSION_ID\",
    \"returnUrl\": \"$RETURN_URL\"
  }")

echo "$CREATE_RESPONSE" | jq .
echo ""

# Extraer token de la respuesta
TOKEN=$(echo "$CREATE_RESPONSE" | jq -r '.data.token')
echo "Token obtenido: $TOKEN"
echo ""
echo "URL para redirigir al usuario:"
echo "$CREATE_RESPONSE" | jq -r '.data.url' | sed "s/\?token=/\?token=/" | xargs -I {} echo "URL + token: {}?token=$TOKEN"
echo ""
echo ""

# 4. Consultar estado (sin confirmar aún)
echo "4. Consultar estado de la transacción (antes de confirmar)..."
echo "POST /api/webpay/status"
curl -s -X POST "$WEBPAY_URL/status" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq .
echo ""
echo ""

# 5. Confirmar transacción
echo "5. Confirmar transacción..."
echo "POST /api/webpay/commit"
COMMIT_RESPONSE=$(curl -s -X POST "$WEBPAY_URL/commit" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}")
echo "$COMMIT_RESPONSE" | jq .
echo ""
echo ""

# 6. Consultar estado (después de confirmar)
echo "6. Consultar estado de la transacción (después de confirmar)..."
echo "POST /api/webpay/status"
curl -s -X POST "$WEBPAY_URL/status" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq .
echo ""
echo ""

# 7. Reembolsar transacción
echo "7. Reembolsar transacción..."
echo "POST /api/webpay/refund"
curl -s -X POST "$WEBPAY_URL/refund" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq .
echo ""
echo ""

echo "=========================================="
echo "Pruebas completadas"
echo "=========================================="

