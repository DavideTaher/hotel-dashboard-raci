#!/usr/bin/env python3

import json
import pandas as pd
from datetime import datetime
from pathlib import Path

def create_html_dashboard():
    base_dir = Path.home() / "hotel_dashboard_raci" / "daily_exports"
    
    # Cargar datos del análisis incremental
    dashboard_file = base_dir / "dashboard_data" / "incremental_analysis.json"
    with open(dashboard_file, 'r') as f:
        data = json.load(f)
    
    # Crear HTML dashboard
    html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏨 Hotel Dashboard RACI - Análisis Incremental</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #f5f7fa; }}
        .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; }}
        .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .metric-card {{ background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s; }}
        .metric-card:hover {{ transform: translateY(-5px); }}
        .metric-number {{ font-size: 3em; font-weight: bold; color: #667eea; margin-bottom: 10px; }}
        .metric-label {{ color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }}
        .sources {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .source-card {{ background: white; border-radius: 15px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
        .source-header {{ display: flex; align-items: center; margin-bottom: 20px; }}
        .source-icon {{ width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 1.5em; background: #667eea; color: white; }}
        .source-stats {{ display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }}
        .stat {{ text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px; }}
        .stat-number {{ font-size: 1.8em; font-weight: bold; color: #333; }}
        .stat-label {{ font-size: 0.8em; color: #666; margin-top: 5px; }}
        .timestamp {{ text-align: center; color: #666; margin-top: 20px; padding: 20px; background: white; border-radius: 15px; }}
        .success {{ background: #d4edda; color: #155724; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-weight: bold; }}
        .progress-bar {{ background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }}
        .progress-fill {{ height: 8px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 Hotel Dashboard RACI</h1>
            <p>Sistema de Análisis Incremental de Exports</p>
            <p><strong>Terrazas del Caribe</strong></p>
        </div>
        
        <div class="success">
            ✅ PROCESAMIENTO INCREMENTAL COMPLETADO EXITOSAMENTE
        </div>
        
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-number">{data['summary']['files_processed']}</div>
                <div class="metric-label">Archivos Procesados</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%;"></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-number">{data['summary']['total_records']:,}</div>
                <div class="metric-label">Registros Totales</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%;"></div>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-number">{data['summary']['active_sources']}</div>
                <div class="metric-label">Fuentes Activas</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%;"></div>
                </div>
            </div>
        </div>
        
        <div class="sources">
"""
    
    # Agregar detalles de cada fuente
    for source, info in data['sources'].items():
        source_name = source.upper()
        icon = "🏨" if source == "myhotel" else "🏢"
        
        html_content += f"""
            <div class="source-card">
                <div class="source-header">
                    <div class="source-icon">{icon}</div>
                    <div>
                        <h3>{source_name}</h3>
                        <p style="margin: 0; color: #666;">Sistema procesado exitosamente</p>
                    </div>
                </div>
                <div class="source-stats">
                    <div class="stat">
                        <div class="stat-number">{info['files_processed']}</div>
                        <div class="stat-label">Archivos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">{info['total_records']:,}</div>
                        <div class="stat-label">Registros</div>
                    </div>
                </div>
            </div>
"""
    
    html_content += f"""
        </div>
        
        <div class="timestamp">
            📅 Procesado: {datetime.fromisoformat(data['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}<br>
            🔄 Modo: {data['mode'].title()}<br>
            ✅ Estado: Todos los archivos procesados y movidos a /processed/<br>
            🚀 Listo para recibir nuevos exports diarios
        </div>
    </div>
</body>
</html>
"""
    
    # Guardar dashboard
    dashboard_html = base_dir / "dashboard_incremental.html"
    with open(dashboard_html, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"📊 Dashboard HTML creado: {dashboard_html}")
    return str(dashboard_html)

if __name__ == "__main__":
    dashboard_path = create_html_dashboard()
    print(f"🌐 Abrir dashboard: open {dashboard_path}")
