#!/bin/bash
echo "🚀 INICIANDO HOTEL DASHBOARD RACI - SISTEMA COMPLETO"
echo "===================================================="
echo ""
echo "📊 Dashboard Completo en: http://localhost:8080"
echo "🔄 Servidor de uploads en: http://localhost:5001"
echo ""
echo "❌ Presiona Ctrl+C para detener"
echo ""

# Copiar el dashboard completo como index
cd ~/hotel_dashboard_raci/frontend_local
cp dashboard_completo.html index.html

# Iniciar servidor
python3 start_server.py
