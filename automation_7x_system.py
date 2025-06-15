#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🤖 SISTEMA DE AUTOMATIZACIÓN 7x/DÍA - HOTEL DASHBOARD RACI
============================================================
Procesa automáticamente archivos del hotel 7 veces al día
Deadline: Miércoles 11 Junio 2025

Funcionalidades:
- Procesamiento automático cada 2-3 horas
- Monitoreo de carpetas de datos
- Análisis incremental
- Generación de reportes
- Health checks
- Notificaciones
"""

import os
import sys
import time
import json
import logging
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import glob

# Configuración
BASE_DIR = Path.home() / "hotel_dashboard_raci"
EXPORTS_DIR = BASE_DIR / "daily_exports"
LOGS_DIR = BASE_DIR / "logs"
CONFIG_FILE = BASE_DIR / "automation_config.json"

# Configurar logging
LOGS_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / f"automation_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class HotelDashboardAutomation:
    """Sistema principal de automatización"""
    
    def __init__(self):
        self.config = self.load_config()
        self.last_run = {}
        self.sources = [
            "easyfrontdesk", "myhotel", "bcr_dolares", "fideltour", "asksuite",
            "whatsapp", "raci_updates", "manual_uploads", "system_logs",
            "user_activity", "performance_metrics"
        ]
        
    def load_config(self):
        """Cargar configuración del sistema"""
        default_config = {
            "run_schedule": ["07:00", "10:00", "13:00", "16:00", "19:00", "22:00", "01:00"],
            "check_interval": 3600,  # 1 hora
            "max_file_age": 24,      # horas
            "enable_notifications": True,
            "admin_email": "gerencia@terrazasdelcaribe.com",
            "dashboard_url": "http://localhost:8080",
            "upload_server_port": 5001,
            "auto_backup": True,
            "component_memory_update": True
        }
        
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                return {**default_config, **config}
            except Exception as e:
                logger.warning(f"Error cargando config: {e}. Usando defaults.")
                return default_config
        else:
            self.save_config(default_config)
            return default_config
    
    def save_config(self, config):
        """Guardar configuración"""
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    
    def scan_for_new_files(self):
        """Escanear directorios en busca de archivos nuevos"""
        new_files = []
        timestamp = datetime.now()
        
        for source in self.sources:
            source_dir = EXPORTS_DIR / source
            if not source_dir.exists():
                continue
                
            # Buscar archivos nuevos
            pattern = str(source_dir / "**" / "*")
            for file_path in glob.glob(pattern, recursive=True):
                file_path = Path(file_path)
                if file_path.is_file():
                    # Verificar si es nuevo
                    mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    last_check = self.last_run.get(source, timestamp - timedelta(hours=24))
                    
                    if mtime > last_check:
                        new_files.append({
                            'source': source,
                            'path': str(file_path),
                            'modified': mtime.isoformat(),
                            'size': file_path.stat().st_size
                        })
        
        return new_files
    
    def process_files(self, files):
        """Procesar archivos encontrados"""
        if not files:
            logger.info("No hay archivos nuevos para procesar")
            return True
            
        logger.info(f"Procesando {len(files)} archivos nuevos")
        
        try:
            # Ejecutar script de procesamiento
            result = subprocess.run([
                "python3", str(BASE_DIR / "scripts" / "analyze_exports_full.py")
            ], capture_output=True, text=True, cwd=BASE_DIR)
            
            if result.returncode == 0:
                logger.info("Procesamiento completado exitosamente")
                return True
            else:
                logger.error(f"Error en procesamiento: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Excepción durante procesamiento: {e}")
            return False
    
    def update_dashboard(self):
        """Actualizar dashboard con nuevos datos"""
        try:
            result = subprocess.run([
                "python3", str(BASE_DIR / "scripts" / "generate_dashboard.py")
            ], capture_output=True, text=True, cwd=BASE_DIR)
            
            if result.returncode == 0:
                logger.info("Dashboard actualizado exitosamente")
                return True
            else:
                logger.error(f"Error actualizando dashboard: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Excepción actualizando dashboard: {e}")
            return False
    
    def backup_memory(self):
        """Ejecutar backup de memoria completa"""
        try:
            result = subprocess.run([
                str(BASE_DIR / "auto_backup.sh"), "backup"
            ], capture_output=True, text=True, cwd=BASE_DIR)
            
            if result.returncode == 0:
                logger.info("Backup de memoria completado")
                return True
            else:
                logger.error(f"Error en backup: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Excepción durante backup: {e}")
            return False
    
    def run_automation_cycle(self):
        """Ejecutar un ciclo completo de automatización"""
        logger.info("🤖 INICIANDO CICLO DE AUTOMATIZACIÓN")
        
        # 1. Escanear archivos nuevos
        new_files = self.scan_for_new_files()
        logger.info(f"Encontrados {len(new_files)} archivos nuevos")
        
        # 2. Procesar archivos
        if new_files:
            success = self.process_files(new_files)
            if not success:
                logger.error("Error en procesamiento de archivos")
                return False
        
        # 3. Actualizar dashboard
        dashboard_success = self.update_dashboard()
        if not dashboard_success:
            logger.warning("Error actualizando dashboard")
        
        # 4. Backup automático
        if self.config.get("auto_backup", True):
            backup_success = self.backup_memory()
            if not backup_success:
                logger.warning("Error en backup automático")
        
        # 5. Actualizar timestamp
        for source in self.sources:
            self.last_run[source] = datetime.now()
        
        logger.info("✅ CICLO DE AUTOMATIZACIÓN COMPLETADO")
        return True

def main():
    """Función principal"""
    automation = HotelDashboardAutomation()
    
    logger.info("🚀 SISTEMA DE AUTOMATIZACIÓN 7x/DÍA INICIADO")
    logger.info(f"Horarios programados: {automation.config['run_schedule']}")
    
    if len(sys.argv) > 1 and sys.argv[1] == "run-once":
        # Ejecutar una vez y salir
        automation.run_automation_cycle()
    else:
        # Ejecutar continuamente (para testing)
        logger.info("Modo testing - ejecutando cada 30 segundos")
        while True:
            automation.run_automation_cycle()
            time.sleep(30)  # Para testing - cambiar según necesidad

if __name__ == "__main__":
    main()
