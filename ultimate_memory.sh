#!/bin/bash

echo "🔄 GUARDANDO SESIÓN ACTUAL..."
./auto_backup.sh chat

echo "🔄 ACTUALIZANDO MEGA-SCAN..."
./mega_scan_hotel.sh

echo "🧠 CARGANDO MEMORIA COMPLETA..."
cat MEGA_SCAN_*/COMPLETE_MEMORY.md
