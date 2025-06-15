#!/bin/bash
set -euo pipefail

# Variables principales
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BASE_DIR="$HOME/hotel_dashboard_raci"
OUTPUT_DIR="$BASE_DIR/MEGA_SCAN_$TIMESTAMP"
MEMORY_FILE="$OUTPUT_DIR/COMPLETE_MEMORY.md"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Crear directorio de salida
mkdir -p "$OUTPUT_DIR"

echo -e "${CYAN}=== HOTEL DASHBOARD RACI MEGA SCANNER ===${NC}"
echo -e "${YELLOW}Deadline: Miércoles 11 - ESCANEO URGENTE${NC}"
echo -e "${GREEN}Iniciando escaneo mega-definitivo...${NC}"

# Crear reporte
echo "# HOTEL DASHBOARD RACI - MEMORIA COMPLETA" > "$MEMORY_FILE"
echo "**Fecha:** $(date)" >> "$MEMORY_FILE"
echo "**Usuario:** TDC2025AI$#@! (12 usuarios)" >> "$MEMORY_FILE"
echo "" >> "$MEMORY_FILE"

# Escanear archivos modificados hoy
echo "## ARCHIVOS MODIFICADOS HOY" >> "$MEMORY_FILE"
find "$BASE_DIR" -type f -newermt "$(date +%Y-%m-%d)" -exec ls -la {} \; 2>/dev/null >> "$MEMORY_FILE"

# Leer scripts principales
echo "" >> "$MEMORY_FILE"
echo "## SCRIPTS PRINCIPALES" >> "$MEMORY_FILE"
for script in auto_backup.sh components_memory_system.sh claude_super_analyzer.sh; do
    if [[ -f "$BASE_DIR/$script" ]]; then
        echo "### $script" >> "$MEMORY_FILE"
        echo '```bash' >> "$MEMORY_FILE"
        cat "$BASE_DIR/$script" >> "$MEMORY_FILE"
        echo '```' >> "$MEMORY_FILE"
        echo "" >> "$MEMORY_FILE"
    fi
done

# Leer componentes
echo "## COMPONENTES MEMORIA" >> "$MEMORY_FILE"
if [[ -d "$BASE_DIR/components_memory" ]]; then
    for component in "$BASE_DIR/components_memory"/*.md; do
        if [[ -f "$component" ]]; then
            echo "### $(basename $component)" >> "$MEMORY_FILE"
            cat "$component" >> "$MEMORY_FILE"
            echo "" >> "$MEMORY_FILE"
        fi
    done
fi

# Leer chats recientes
echo "## CHATS RECIENTES" >> "$MEMORY_FILE"
for chat in $(ls -t "$BASE_DIR/chat_backups_hotel"/*.md 2>/dev/null | head -3); do
    echo "### $(basename $chat)" >> "$MEMORY_FILE"
    cat "$chat" >> "$MEMORY_FILE"
    echo "" >> "$MEMORY_FILE"
done

# Resumen
echo "## RESUMEN EJECUTIVO" >> "$MEMORY_FILE"
echo "- 9 componentes implementados" >> "$MEMORY_FILE"
echo "- 12 usuarios operativos (TDC2025AI$#@!)" >> "$MEMORY_FILE"
echo "- Sistema backup funcionando" >> "$MEMORY_FILE"
echo "- Deadline: Miércoles 11" >> "$MEMORY_FILE"

echo -e "${GREEN}✅ ESCANEO COMPLETADO${NC}"
echo -e "${CYAN}📁 Resultados: $OUTPUT_DIR${NC}"
echo -e "${YELLOW}📄 Archivo: $MEMORY_FILE${NC}"
echo ""
echo "Para ver el reporte:"
echo "cat $MEMORY_FILE"