#!/bin/bash

# ============================================================================
# 🔧 INSTALADOR SISTEMA AUTOMATIZACIÓN 7x/DÍA - HOTEL DASHBOARD RACI
# ============================================================================

echo "🔧 INSTALANDO SISTEMA DE AUTOMATIZACIÓN 7x/DÍA"
echo "================================================"
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Verificar directorio
if [ ! -d ~/hotel_dashboard_raci ]; then
    echo "❌ Error: Directorio ~/hotel_dashboard_raci no existe"
    exit 1
fi

cd ~/hotel_dashboard_raci

# 1. Crear directorios necesarios
echo "📁 Creando estructura de directorios..."
mkdir -p logs
mkdir -p daily_exports/{easyfrontdesk,myhotel,bcr_dolares,fideltour,asksuite,whatsapp,raci_updates,manual_uploads,system_logs,user_activity,performance_metrics}/processed
mkdir -p daily_exports/dashboard_data
echo "✅ Directorios creados"

# 2. Instalar dependencias Python
echo ""
echo "🐍 Verificando dependencias Python..."

# Verificar si python3 está disponible
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 no está instalado"
    exit 1
fi

# Crear requirements.txt si no existe
if [ ! -f requirements.txt ]; then
    cat > requirements.txt << 'REQS'
schedule==1.2.0
pandas>=1.5.0
requests>=2.28.0
openpyxl>=3.0.0
xlsxwriter>=3.0.0
python-dateutil>=2.8.0
REQS
    echo "📄 Archivo requirements.txt creado"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
python3 -m pip install -r requirements.txt --user
if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas"
else
    echo "⚠️ Advertencia: Algunas dependencias pueden no haberse instalado"
fi

# 3. Hacer ejecutables los scripts
echo ""
echo "🔐 Configurando permisos..."
chmod +x automation_7x_system.py
chmod +x auto_backup.sh
chmod +x components_memory_system.sh
chmod +x mega_scan_hotel.sh
chmod +x ultimate_memory.sh
if [ -f launch_system.sh ]; then
    chmod +x launch_system.sh
fi
echo "✅ Permisos configurados"

# 4. Crear archivo de configuración inicial
echo ""
echo "⚙️ Creando configuración inicial..."
cat > automation_config.json << 'CONFIG'
{
  "run_schedule": ["07:00", "10:00", "13:00", "16:00", "19:00", "22:00", "01:00"],
  "check_interval": 3600,
  "max_file_age": 24,
  "enable_notifications": true,
  "admin_email": "gerencia@terrazasdelcaribe.com",
  "dashboard_url": "http://localhost:8080",
  "upload_server_port": 5001,
  "auto_backup": true,
  "component_memory_update": true,
  "sources": [
    "easyfrontdesk",
    "myhotel", 
    "bcr_dolares",
    "fideltour",
    "asksuite",
    "whatsapp",
    "raci_updates",
    "manual_uploads",
    "system_logs",
    "user_activity",
    "performance_metrics"
  ]
}
CONFIG
echo "✅ Configuración creada: automation_config.json"

# 5. Crear script de cron para automatización
echo ""
echo "⏰ Configurando automatización cron..."
cat > setup_cron.sh << 'CRON'
#!/bin/bash
# Script para configurar cron jobs

# Eliminar cron jobs existentes para el proyecto
crontab -l 2>/dev/null | grep -v "hotel_dashboard_raci" | crontab -

# Agregar nuevos cron jobs
(crontab -l 2>/dev/null; echo "# Hotel Dashboard RACI - Automatización 7x/día") | crontab -
(crontab -l 2>/dev/null; echo "0 7,10,13,16,19,22,1 * * * cd ~/hotel_dashboard_raci && python3 automation_7x_system.py run-once >> logs/cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "# Health check cada hora") | crontab -
(crontab -l 2>/dev/null; echo "30 * * * * cd ~/hotel_dashboard_raci && echo '$(date): Health check' >> logs/health.log") | crontab -

echo "✅ Cron jobs configurados para automatización 7x/día"
echo "Horarios: 07:00, 10:00, 13:00, 16:00, 19:00, 22:00, 01:00"
CRON
chmod +x setup_cron.sh
echo "✅ Script de cron creado: setup_cron.sh"

# 6. Testing básico
echo ""
echo "🧪 Ejecutando testing básico..."
python3 -c "
import json
import sys
sys.path.append('.')

try:
    # Test configuración
    with open('automation_config.json', 'r') as f:
        config = json.load(f)
    print('✅ Configuración JSON válida')
    
    # Test imports
    import datetime
    import pathlib
    import subprocess
    print('✅ Imports básicos funcionando')
    
    print('✅ Testing básico completado')
except Exception as e:
    print(f'❌ Error en testing: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo "✅ Testing básico exitoso"
else
    echo "❌ Error en testing básico"
    exit 1
fi

# 7. Resumen final
echo ""
echo "🎯 INSTALACIÓN COMPLETADA"
echo "========================="
echo "✅ Directorios creados"
echo "✅ Dependencias instaladas"
echo "✅ Permisos configurados"
echo "✅ Configuración creada"
echo "✅ Scripts cron preparados"
echo "✅ Testing básico exitoso"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Ejecutar: ./setup_cron.sh (para automatización)"
echo "2. Ejecutar: ./launch_system.sh (para lanzar sistema)"
echo "3. Verificar: python3 automation_7x_system.py run-once (test manual)"
echo ""
echo "🚀 Sistema listo para el deadline del miércoles 11!"
