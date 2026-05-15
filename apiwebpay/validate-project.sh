#!/bin/bash

# Script de validación del proyecto
# Verifica que todos los archivos están creados correctamente

echo "=========================================="
echo "Validación de Estructura del Proyecto"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (FALTA)"
        return 1
    fi
}

# Función para verificar carpeta
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ (FALTA)"
        return 1
    fi
}

echo "Archivos de Configuración:"
check_file "pom.xml"
check_file "application.properties"
check_file ".gitignore"

echo ""
echo "Documentación:"
check_file "README.md"
check_file "EXAMPLES.md"
check_file "INSTALLATION.md"
check_file "PROYECTO_COMPLETADO.md"

echo ""
echo "Estructura de Carpetas:"
check_dir "src/main/java/com/webpaytest/api"
check_dir "src/main/java/com/webpaytest/api/config"
check_dir "src/main/java/com/webpaytest/api/controller"
check_dir "src/main/java/com/webpaytest/api/service"
check_dir "src/main/java/com/webpaytest/api/dto"
check_dir "src/main/java/com/webpaytest/api/exception"

echo ""
echo "Archivos Java - Config:"
check_file "src/main/java/com/webpaytest/api/config/WebpayConfig.java"

echo ""
echo "Archivos Java - Controllers:"
check_file "src/main/java/com/webpaytest/api/controller/WebpayController.java"
check_file "src/main/java/com/webpaytest/api/controller/HealthController.java"

echo ""
echo "Archivos Java - Services:"
check_file "src/main/java/com/webpaytest/api/service/WebpayService.java"

echo ""
echo "Archivos Java - DTOs:"
check_file "src/main/java/com/webpaytest/api/dto/ApiResponse.java"
check_file "src/main/java/com/webpaytest/api/dto/CreateTransactionRequest.java"
check_file "src/main/java/com/webpaytest/api/dto/CreateTransactionResponse.java"
check_file "src/main/java/com/webpaytest/api/dto/CommitTransactionRequest.java"
check_file "src/main/java/com/webpaytest/api/dto/CommitTransactionResponse.java"
check_file "src/main/java/com/webpaytest/api/dto/GetStatusRequest.java"
check_file "src/main/java/com/webpaytest/api/dto/GetStatusResponse.java"
check_file "src/main/java/com/webpaytest/api/dto/RefundTransactionRequest.java"
check_file "src/main/java/com/webpaytest/api/dto/RefundTransactionResponse.java"

echo ""
echo "Archivos Java - Exceptions:"
check_file "src/main/java/com/webpaytest/api/exception/WebpayException.java"
check_file "src/main/java/com/webpaytest/api/exception/GlobalExceptionHandler.java"

echo ""
echo "Archivos Java - Main:"
check_file "src/main/java/com/webpaytest/api/ApiApplication.java"

echo ""
echo "Scripts de Prueba:"
check_file "test-api.sh"

echo ""
echo "=========================================="
echo "Validación Completada"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. cd /Users/andresbluna/development/api"
echo "2. mvn clean install"
echo "3. mvn spring-boot:run"
echo "4. curl http://localhost:8080/api/health"
echo ""

