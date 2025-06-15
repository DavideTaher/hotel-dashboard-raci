#!/usr/bin/env python3

import os
import json
import pandas as pd
from datetime import datetime
from pathlib import Path
import glob
import shutil

def analyze_all_exports():
    base_dir = Path.home() / "hotel_dashboard_raci" / "daily_exports"
    
    print("🏨 ANALIZANDO TODOS LOS EXPORTS - MODO INCREMENTAL")
    print("=" * 60)
    
    total_files = 0
    total_records = 0
    results = {}
    
    sources = ["myhotel", "asksuite", "easyfrontdesk", "bac_colones", "bac_dolares", "bcr_colones", "bcr_dolares"]
    
    for source in sources:
        incoming_dir = base_dir / source / "incoming"
        processed_dir = base_dir / source / "processed"
        processed_dir.mkdir(exist_ok=True)
        
        if not incoming_dir.exists():
            continue
            
        # Buscar TODOS los archivos
        all_files = list(incoming_dir.glob("*"))
        if not all_files:
            continue
            
        print(f"\n📂 {source.upper()}: {len(all_files)} archivos encontrados")
        
        source_records = 0
        source_files = 0
        
        for file_path in all_files:
            if file_path.is_file():
                try:
                    print(f"  🔍 Procesando: {file_path.name}")
                    
                    # Intentar leer según extensión
                    if file_path.suffix.lower() == '.csv':
                        df = pd.read_csv(file_path)
                    elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                        df = pd.read_excel(file_path)
                    elif file_path.suffix.lower() == '.json':
                        with open(file_path, 'r') as f:
                            data = json.load(f)
                        df = pd.DataFrame(data)
                    else:
                        print(f"    ⚠️ Formato no soportado: {file_path.suffix}")
                        continue
                        
                    records = len(df)
                    print(f"    ✅ {records} registros procesados")
                    print(f"    📋 Columnas: {list(df.columns)}")
                    
                    # Análisis específico por fuente
                    if source == 'myhotel':
                        if any('reserv' in col.lower() or 'book' in col.lower() for col in df.columns):
                            print(f"    🏨 Datos de reservas detectados")
                        if any('amount' in col.lower() or 'total' in col.lower() for col in df.columns):
                            print(f"    💰 Datos financieros detectados")
                    
                    # Mover archivo a procesados con timestamp
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    new_name = f"{timestamp}_{file_path.name}"
                    shutil.move(str(file_path), str(processed_dir / new_name))
                    print(f"    📁 Movido a: processed/{new_name}")
                    
                    source_records += records
                    source_files += 1
                    
                except Exception as e:
                    print(f"    ❌ Error: {str(e)}")
                    continue
        
        if source_files > 0:
            results[source] = {
                "files_processed": source_files,
                "total_records": source_records,
                "last_processed": datetime.now().isoformat()
            }
            total_files += source_files
            total_records += source_records
            
            print(f"  📊 TOTAL {source}: {source_files} archivos, {source_records} registros")
    
    # Resumen final
    print(f"\n🎯 RESUMEN INCREMENTAL:")
    print(f"   📄 Archivos procesados: {total_files}")
    print(f"   📊 Registros totales: {total_records}")
    print(f"   🏷️ Fuentes activas: {len(results)}")
    
    # Verificar archivos restantes
    print(f"\n📋 ARCHIVOS PENDIENTES:")
    for source in sources:
        incoming_dir = base_dir / source / "incoming"
        if incoming_dir.exists():
            remaining = len(list(incoming_dir.glob("*")))
            if remaining > 0:
                print(f"   📂 {source}: {remaining} archivos pendientes")
            else:
                print(f"   ✅ {source}: Todos procesados")
    
    # Guardar resultados
    dashboard_file = base_dir / "dashboard_data" / "incremental_analysis.json"
    dashboard_file.parent.mkdir(exist_ok=True)
    
    dashboard_data = {
        "timestamp": datetime.now().isoformat(),
        "mode": "incremental",
        "sources": results,
        "summary": {
            "files_processed": total_files,
            "total_records": total_records,
            "active_sources": len(results)
        }
    }
    
    with open(dashboard_file, 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    
    print(f"\n📄 Dashboard incremental: {dashboard_file}")

if __name__ == "__main__":
    analyze_all_exports()
