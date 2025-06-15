#!/bin/bash

# ============================================================================
# 🔍 VERIFICACIÓN COMPLETA DE SERVICIOS GOOGLE - HOTEL DASHBOARD TDC
# ============================================================================

echo "🔍 VERIFICACIÓN DE SERVICIOS GOOGLE PARA TERRAZAS DEL CARIBE"
echo "=============================================================="
echo "📅 $(date)"
echo "⏰ Deadline: Mañana Miércoles 11"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar comando
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✅ $1 está instalado${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 NO está instalado${NC}"
        return 1
    fi
}

echo "🔧 VERIFICANDO HERRAMIENTAS BÁSICAS"
echo "=================================="

# Verificar herramientas esenciales
check_command "python3"
check_command "pip3"
check_command "node"
check_command "npm"
check_command "curl"
check_command "gcloud"

echo ""
echo "📦 VERIFICANDO GOOGLE CLOUD SDK"
echo "==============================="

# Verificar Google Cloud SDK
if check_command "gcloud"; then
    echo "📋 Información de gcloud:"
    gcloud version 2>/dev/null || echo -e "${YELLOW}⚠️ Error ejecutando gcloud version${NC}"
    
    echo ""
    echo "👤 Configuración actual:"
    gcloud config list 2>/dev/null || echo -e "${YELLOW}⚠️ No hay configuración de gcloud${NC}"
    
    echo ""
    echo "🔑 Cuentas autenticadas:"
    gcloud auth list 2>/dev/null || echo -e "${YELLOW}⚠️ No hay cuentas autenticadas${NC}"
else
    echo -e "${RED}❌ Google Cloud SDK no está instalado${NC}"
    echo -e "${BLUE}💡 Para instalarlo: curl https://sdk.cloud.google.com | bash${NC}"
fi

echo ""
echo "🌐 VERIFICANDO CONECTIVIDAD"
echo "=========================="

# Verificar internet
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}✅ Conectividad a Google: OK${NC}"
else
    echo -e "${RED}❌ Sin conectividad a Google${NC}"
fi

echo ""
echo "📊 RESUMEN VERIFICACIÓN"
echo "======================"

echo "Estado para deadline miércoles 11:"
echo "- Herramientas: $(check_command "python3" >/dev/null && echo "✅" || echo "❌") $(check_command "node" >/dev/null && echo "✅" || echo "❌")"
echo "- Google Cloud: $(check_command "gcloud" >/dev/null && echo "✅" || echo "❌")"
echo "- Internet: $(ping -c 1 google.com &>/dev/null && echo "✅" || echo "❌")"

