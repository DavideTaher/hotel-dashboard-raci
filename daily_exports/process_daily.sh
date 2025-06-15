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
