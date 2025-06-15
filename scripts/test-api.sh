#!/bin/bash
echo "🧪 Test API Hotel Terrazas del Caribe"
echo "====================================="

# Test endpoint locale (modifica con il tuo URL)
API_URL="http://localhost:3000"  # o l'URL corretto della tua API

echo "📡 Test endpoint di salute:"
curl -s "$API_URL/health" || echo "❌ API non raggiungibile"

echo -e "\n📡 Test endpoint rooms:"
curl -s "$API_URL/api/rooms" || echo "❌ Endpoint rooms non disponibile"
