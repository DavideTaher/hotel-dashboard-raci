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
