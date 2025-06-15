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
