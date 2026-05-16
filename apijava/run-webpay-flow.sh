#!/bin/bash

# ==============================================================================
# WEBPAY PLUS - SCRIPT DE PRUEBAS INTERACTIVAS LOCALES
# ==============================================================================
# Este script te permite ejecutar paso a paso las peticiones de Webpay
# API LOCAL: http://localhost:8080
# ==============================================================================

# Colores para salida en consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080/api/webpay"
export TOKEN=""
export URL=""

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${YELLOW}               WEBPAY PLUS - FLUJO DE INTEGRACIÓN LOCAL${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# =========================================================
# 1. CREAR TRANSACCIÓN
# =========================================================
echo -e "\n${GREEN}[PASO 1] Creando nueva transacción...${NC}"
echo -e "Endpoint: POST /api/webpay/create"

BUY_ORDER="ORDER-$(date +%s)"
SESSION_ID="SESSION-$(date +%s)"
AMOUNT=1000
RETURN_URL="http://localhost:8080/api/webpay/commit"

RESPONSE=$(curl -s -X POST "$API_URL/create" \
-H "Content-Type: application/json" \
-d "{
  \"buyOrder\": \"$BUY_ORDER\",
  \"sessionId\": \"$SESSION_ID\",
  \"amount\": $AMOUNT,
  \"returnUrl\": \"$RETURN_URL\"
}")

# Verifica si se recibe jq para mostrar el JSON formateado
if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq .
else
    echo "$RESPONSE"
fi

# Extraer TOKEN y URL (forma simple usando grep/awk o bash si no hay jq)
if command -v jq &> /dev/null; then
    TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
    URL=$(echo "$RESPONSE" | jq -r '.data.url')
else
    TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    URL=$(echo $RESPONSE | grep -o '"url":"[^"]*' | grep -o '[^"]*$')
fi

# =========================================================
# 2. INSTRUCCIONES PARA EL PAGO
# =========================================================
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "\n${YELLOW}▶ ¡TRANSACCIÓN CREADA EXITOSAMENTE!${NC}"
    echo -e "Token: ${BLUE}$TOKEN${NC}"
    echo -e "\n${YELLOW}[PASO 2] PAGA EN EL NAVEGADOR${NC}"
    echo -e "Abre la siguiente URL en tu navegador:\n"
    echo -e "${GREEN}${URL}?token_ws=${TOKEN}${NC}\n"

    echo -e "Usa estos datos de prueba en la pantalla de Webpay:"
    echo -e "- Tarjeta VISA: ${GREEN}4051 8856 0044 6623${NC}"
    echo -e "- CVV: ${GREEN}123${NC}"
    echo -e "- Vencimiento: ${GREEN}12/26${NC} (o cualquiera futura)"
    echo -e "- RUT (si te lo piden): ${GREEN}11.111.111-1${NC}"
    echo -e "- Clave (Pin): ${GREEN}123${NC}"

    echo -e "\n${RED}>>> PAUSA: Anda al navegador, completa el flujo de pago y luego vuelve a esta consola. <<<${NC}"
    read -p "Presiona ENTER sólo DESPUÉS de haber terminado el pago en Webpay..."

else
    echo -e "\n${RED}Hubo un error recuperando el Token. Abortando flujo.${NC}"
    exit 1
fi


# =========================================================
# 3. CONFIRMAR TRANSACCIÓN (COMMIT)
# =========================================================
echo -e "\n${GREEN}[PASO 3] Confirmando la transacción (Commit)...${NC}"
echo -e "Endpoint: POST /api/webpay/commit"

RESPONSE=$(curl -s -X POST "$API_URL/commit" \
-H "Content-Type: application/json" \
-d "{
  \"token\": \"$TOKEN\"
}")

if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq .
else
    echo "$RESPONSE"
fi

echo -e "\n${RED}>>> PAUSA <<<${NC}"
read -p "Presiona ENTER para continuar con la consulta de estado..."

# =========================================================
# 4. CONSULTAR ESTADO
# =========================================================
echo -e "\n${GREEN}[PASO 4] Consultando Estado de la transacción...${NC}"
echo -e "Endpoint: POST /api/webpay/status"

RESPONSE=$(curl -s -X POST "$API_URL/status" \
-H "Content-Type: application/json" \
-d "{
  \"token\": \"$TOKEN\"
}")

if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq .
else
    echo "$RESPONSE"
fi

echo -e "\n${RED}>>> PAUSA <<<${NC}"
read -p "Presiona ENTER para ejecutar el reembolso (Refund)..."

# =========================================================
# 5. REEMBOLSAR TRANSACCIÓN
# =========================================================
echo -e "\n${GREEN}[PASO 5] Reembolsando o Anulando transacción (Refund)...${NC}"
echo -e "Endpoint: POST /api/webpay/refund"

RESPONSE=$(curl -s -X POST "$API_URL/refund" \
-H "Content-Type: application/json" \
-d "{
  \"token\": \"$TOKEN\"
}")

if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq .
else
    echo "$RESPONSE"
fi

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${YELLOW}                         FIN DEL FLUJO DE PRUEBAS${NC}"
echo -e "${BLUE}==============================================================================${NC}"

