#!/bin/bash
case "$1" in
    "save")
        echo "💾 Estado guardado: $(date)" >> PROJECT_LOG.txt
        echo "✅ Estado guardado"
        ;;
    "status")
        echo "🚀 HOTEL DASHBOARD RACI - STATUS"
        echo "Deadline: Miércoles 11 Diciembre 2025"
        echo "Frontend: ✅ React 19 + Vite + MUI instalado"
        echo "Backend: ⏳ Pendiente"
        echo "Directorio: $(pwd)"
        ;;
    *)
        echo "Uso: $0 {save|status}"
        ;;
esac
