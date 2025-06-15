#!/bin/bash

echo "🚀 DEPLOY SISTEMA DE EXPORTS DIARIOS - HOTEL DASHBOARD RACI"
echo "==========================================================="
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Configuración
HOTEL_DIR="$HOME/hotel_dashboard_raci"
EXPORTS_DIR="$HOTEL_DIR/daily_exports"
SCRIPTS_DIR="$HOTEL_DIR/scripts"

# Crear directorios
mkdir -p "$SCRIPTS_DIR"
mkdir -p "$EXPORTS_DIR"

echo "✅ Creando estructura de directorios..."

# Fuentes de datos
SOURCES=(
    "myhotel" "asksuite" "fideltour" "greatdeals" "easyfrontdesk" 
    "meta" "bac_colones" "bac_dolares" "bcr_colones" "bcr_dolares" "boxhere"
)

# Crear estructura
for source in "${SOURCES[@]}"; do
    for subdir in "incoming" "processed" "analysis" "dashboard_data" "backup" "reports" "logs"; do
        mkdir -p "$EXPORTS_DIR/$source/$subdir"
    done
done

mkdir -p "$EXPORTS_DIR/consolidated_analysis"
mkdir -p "$EXPORTS_DIR/dashboard_data"

echo "✅ Estructura creada: $(find "$EXPORTS_DIR" -type d | wc -l) directorios"

# Crear datos de ejemplo
echo "📝 Creando datos de ejemplo..."

# MyHotel ejemplo
cat > "$EXPORTS_DIR/myhotel/incoming/ejemplo_myhotel.csv" << 'MYHOTEL_DATA'
fecha,habitacion,huesped,estado,tarifa_colones,noches,pais,canal
2025-06-09,101,Juan Perez,confirmada,85000,2,Costa Rica,Directo
2025-06-09,102,Maria Garcia,check-in,95000,3,USA,Booking.com
2025-06-09,201,Carlos Lopez,check-out,120000,1,Canada,Expedia
2025-06-08,103,Ana Rodriguez,confirmada,75000,4,Costa Rica,Agencia
2025-06-08,202,David Wilson,cancelada,110000,2,USA,Directo
MYHOTEL_DATA

# AskSuite ejemplo
cat > "$EXPORTS_DIR/asksuite/incoming/ejemplo_asksuite.json" << 'ASKSUITE_DATA'
[
  {
    "timestamp": "2025-06-09T10:30:00",
    "conversation_id": "conv_001",
    "user_message": "Quiero hacer una reserva para este fin de semana",
    "bot_response": "¡Perfecto! Te ayudo con tu reserva",
    "intent": "reservation",
    "sentiment": "positive",
    "resolved": true
  },
  {
    "timestamp": "2025-06-09T11:15:00", 
    "conversation_id": "conv_002",
    "user_message": "¿Tienen spa y qué servicios incluye?",
    "bot_response": "Sí, tenemos spa completo con masajes, sauna y jacuzzi",
    "intent": "services_inquiry",
    "sentiment": "neutral",
    "resolved": true
  },
  {
    "timestamp": "2025-06-09T14:20:00",
    "conversation_id": "conv_003", 
    "user_message": "Necesito cancelar mi reserva urgente",
    "bot_response": "Entiendo tu situación, te ayudo con la cancelación",
    "intent": "cancellation",
    "sentiment": "negative",
    "resolved": false
  }
]
ASKSUITE_DATA

# BAC ejemplo
cat > "$EXPORTS_DIR/bac_colones/incoming/ejemplo_bac_colones.csv" << 'BAC_DATA'
fecha,descripcion,monto,tipo,saldo
2025-06-09,Deposito hotel huespedes,450000,credito,2850000
2025-06-08,Pago proveedores,-125000,debito,2400000
2025-06-07,Ingresos restaurante,85000,credito,2525000
2025-06-06,Servicios bancarios,-15000,debito,2440000
BAC_DATA

echo "✅ Archivos de ejemplo creados"

# Crear script simple de análisis
cat > "$SCRIPTS_DIR/analyze_exports.py" << 'PYTHON_ANALYZER'
#!/usr/bin/env python3

import os
import json
import pandas as pd
from datetime import datetime
from pathlib import Path
import glob

def analyze_exports():
    base_dir = Path.home() / "hotel_dashboard_raci" / "daily_exports"
    
    print("🏨 ANALIZANDO EXPORTS DIARIOS")
    print("=" * 40)
    
    total_files = 0
    results = {}
    
    sources = ["myhotel", "asksuite", "bac_colones", "bac_dolares", "bcr_colones", "bcr_dolares"]
    
    for source in sources:
        incoming_dir = base_dir / source / "incoming"
        if not incoming_dir.exists():
            continue
            
        files = list(incoming_dir.glob("*"))
        if not files:
            continue
            
        print(f"\n📂 {source.upper()}:")
        
        for file_path in files:
            try:
                if file_path.suffix.lower() == '.csv':
                    df = pd.read_csv(file_path)
                elif file_path.suffix.lower() == '.json':
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    df = pd.DataFrame(data)
                else:
                    continue
                    
                print(f"  ✅ {file_path.name}: {len(df)} registros")
                
                # Análisis específico
                if source == 'myhotel':
                    if 'estado' in df.columns:
                        estados = df['estado'].value_counts()
                        print(f"     🏨 Estados: {dict(estados)}")
                    if 'tarifa_colones' in df.columns:
                        total_ingresos = df['tarifa_colones'].sum()
                        print(f"     💰 Ingresos: ₡{total_ingresos:,}")
                        
                elif source == 'asksuite':
                    if 'sentiment' in df.columns:
                        sentiments = df['sentiment'].value_counts()
                        print(f"     😊 Sentimientos: {dict(sentiments)}")
                    if 'resolved' in df.columns:
                        resolved_count = df['resolved'].sum()
                        print(f"     🎯 Resueltos: {resolved_count}/{len(df)}")
                        
                elif 'bac' in source or 'bcr' in source:
                    if 'monto' in df.columns:
                        total = df['monto'].sum()
                        print(f"     💰 Balance: ₡{total:,}")
                
                total_files += 1
                results[source] = {"records": len(df), "file": file_path.name}
                
            except Exception as e:
                print(f"  ❌ Error en {file_path.name}: {e}")
    
    # Resumen
    print(f"\n📊 RESUMEN:")
    print(f"   Archivos procesados: {total_files}")
    print(f"   Fuentes activas: {len(results)}")
    
    # Guardar resultados
    dashboard_file = base_dir / "dashboard_data" / "latest_analysis.json"
    dashboard_file.parent.mkdir(exist_ok=True)
    
    dashboard_data = {
        "timestamp": datetime.now().isoformat(),
        "sources": results,
        "summary": {
            "files_processed": total_files,
            "active_sources": len(results)
        }
    }
    
    with open(dashboard_file, 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    
    print(f"   📄 Dashboard: {dashboard_file}")

if __name__ == "__main__":
    analyze_exports()
PYTHON_ANALYZER

chmod +x "$SCRIPTS_DIR/analyze_exports.py"

# Crear script de procesamiento diario
cat > "$EXPORTS_DIR/process_daily.sh" << 'PROCESS_SCRIPT'
#!/bin/bash

echo "🔄 PROCESAMIENTO DIARIO - $(date)"
echo "================================"

cd "$(dirname "$0")"
python3 ../scripts/analyze_exports.py

echo ""
echo "📊 ESTADO ARCHIVOS:"
for source_dir in */; do
    if [ -d "$source_dir" ] && [[ ! "$source_dir" =~ ^(consolidated_analysis|dashboard_data)/ ]]; then
        source_name=$(basename "$source_dir")
        incoming_count=$(find "$source_dir/incoming" -type f 2>/dev/null | wc -l)
        if [ $incoming_count -gt 0 ]; then
            echo "📂 $source_name: $incoming_count archivos"
        fi
    fi
done
PROCESS_SCRIPT

chmod +x "$EXPORTS_DIR/process_daily.sh"

# Configurar aliases
echo ""
echo "🔧 Configurando comandos..."

ALIASES=(
    'alias exports_daily="~/hotel_dashboard_raci/daily_exports/process_daily.sh"'
    'alias exports_status="find ~/hotel_dashboard_raci/daily_exports/*/incoming -name \"*\" 2>/dev/null | wc -l"'
)

for alias_cmd in "${ALIASES[@]}"; do
    if ! grep -q "$alias_cmd" ~/.zshrc 2>/dev/null; then
        echo "$alias_cmd" >> ~/.zshrc
    fi
done

echo "✅ Sistema instalado completamente"
echo ""
echo "📋 COMANDOS DISPONIBLES:"
echo "   exports_daily  - Procesar exports"
echo "   exports_status - Ver archivos pendientes"
echo ""
echo "🚀 EJECUTAR TEST:"
echo "   ./daily_exports/process_daily.sh"
echo ""
echo "✨ DEPLOY COMPLETADO"
