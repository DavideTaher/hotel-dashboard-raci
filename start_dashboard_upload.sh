#!/bin/bash
echo "🚀 INICIANDO HOTEL DASHBOARD RACI - DRAG & DROP"
echo "=============================================="
echo "📊 Dashboard disponible en: http://localhost:8080"
echo "🔄 Servidor de uploads en: http://localhost:5000"
echo "❌ Presiona Ctrl+C para detener"
echo ""
cd frontend_local
cp index_upload.html index.html
python3 start_server.py
