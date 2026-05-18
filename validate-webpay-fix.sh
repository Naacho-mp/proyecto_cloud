#!/bin/bash

# Script de Validación para Integración Transbank Webpay Plus
# Este script verifica que todos los cambios están correctamente implementados

set -e

echo "🔍 VALIDANDO INTEGRACIÓN TRANSBANK WEBPAY PLUS"
echo "================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Función para imprimir resultados
check_file() {
    local file=$1
    local pattern=$2
    local description=$3

    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} $description"
        echo "   Archivo: $file"
        echo "   Patrón: $pattern"
        ((FAIL++))
    fi
}

echo "📋 VALIDACIONES:"
echo ""

# 1. Verificar que CarritoLateral.jsx usa formulario POST
echo "1️⃣  CarritoLateral.jsx - Formulario POST:"
check_file "front-cloud/mi-tienda/src/componentes/CarritoLateral.jsx" "form.method = 'POST'" \
    "Usa método POST en formulario"
check_file "front-cloud/mi-tienda/src/componentes/CarritoLateral.jsx" "tokenInput.name = 'token_ws'" \
    "Incluye token_ws en formulario"
check_file "front-cloud/mi-tienda/src/componentes/CarritoLateral.jsx" "form.submit()" \
    "Hace submit del formulario"

echo ""

# 2. Verificar que application.properties tiene X-Forwarded headers
echo "2️⃣  application.properties - Headers X-Forwarded:"
check_file "apijava/src/main/resources/application.properties" "server.tomcat.remoteip.remote-ip-header" \
    "Configura remote-ip-header"
check_file "apijava/src/main/resources/application.properties" "server.tomcat.remoteip.protocol-header" \
    "Configura protocol-header"
check_file "apijava/src/main/resources/application.properties" "server.tomcat.remoteip.protocol-header-https-value" \
    "Configura protocol-header-https-value"

echo ""

# 3. Verificar nginx.conf tiene proxy headers
echo "3️⃣  nginx.conf - Proxy Headers:"
check_file "front-cloud/mi-tienda/nginx.conf" "proxy_set_header X-Forwarded-Proto" \
    "Pasa X-Forwarded-Proto"
check_file "front-cloud/mi-tienda/nginx.conf" "proxy_set_header X-Forwarded-For" \
    "Pasa X-Forwarded-For"
check_file "front-cloud/mi-tienda/nginx.conf" "proxy_set_header Host" \
    "Pasa Host header"

echo ""

# 4. Verificar WebpayRetorno.jsx usa useSearchParams y useNavigate
echo "4️⃣  WebpayRetorno.jsx - React Router Hooks:"
check_file "front-cloud/mi-tienda/src/componentes/WebpayRetorno.jsx" "useSearchParams" \
    "Importa useSearchParams"
check_file "front-cloud/mi-tienda/src/componentes/WebpayRetorno.jsx" "useNavigate" \
    "Importa useNavigate"
check_file "front-cloud/mi-tienda/src/componentes/WebpayRetorno.jsx" "searchParams.get('token_ws')" \
    "Obtiene token_ws de URL correctamente"

echo ""

# 5. Verificar que se elimina old location.href
echo "5️⃣  CarritoLateral.jsx - Sin location.href directo:"
if grep -q "top.location.href\|window.location.href" "front-cloud/mi-tienda/src/componentes/CarritoLateral.jsx" 2>/dev/null; then
    echo -e "${RED}❌${NC} Aún contiene location.href directo (debe removerse)"
    ((FAIL++))
else
    echo -e "${GREEN}✅${NC} No contiene location.href directo al Transbank"
    ((PASS++))
fi

echo ""
echo "================================================"
echo -e "Resultados: ${GREEN}✅ PASSED: $PASS${NC} | ${RED}❌ FAILED: $FAIL${NC}"
echo "================================================"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 TODAS LAS VALIDACIONES PASARON${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Recompilar el proyecto Java:"
    echo "   cd apijava && ./mvnw clean package -DskipTests"
    echo ""
    echo "2. Reconstruir imágenes Docker:"
    echo "   docker-compose build"
    echo ""
    echo "3. Reiniciar servicios:"
    echo "   docker-compose down && docker-compose up"
    echo ""
    echo "4. Testing:"
    echo "   - Ir a http://localhost:3000/productos"
    echo "   - Agregar productos al carrito"
    echo "   - Click en 'Ir a Pagar'"
    echo "   - Verificar que se redirige a Transbank correctamente"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  EXISTEN VALIDACIONES FALLIDAS${NC}"
    echo ""
    echo "Por favor revisa los archivos mencionados y realiza las correcciones."
    exit 1
fi

