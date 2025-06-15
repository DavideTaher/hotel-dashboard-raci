import re

# Leer el archivo
with open('/Users/apple/hotel_dashboard_raci/frontend_local/dashboard_completo.html', 'r') as f:
    content = f.read()

# Buscar la sección de sources
old_sources = """const sources = [
                { id: 'myhotel', name: 'MyHotel', icon: '🏨' },
                { id: 'easyfrontdesk', name: 'EasyFrontDesk', icon: '🏢' },
                { id: 'asksuite', name: 'AskSuite', icon: '💬' },
                { id: 'bac_colones', name: 'BAC Colones', icon: '🏦' },
                { id: 'bac_dolares', name: 'BAC Dólares', icon: '💵' },
                { id: 'bcr_colones', name: 'BCR Colones', icon: '🏛️' },
                { id: 'bcr_dolares', name: 'BCR Dólares', icon: '💲' }
            ];"""

new_sources = """const sources = [
                { id: 'myhotel', name: 'MyHotel', icon: '🏨' },
                { id: 'easyfrontdesk', name: 'EasyFrontDesk', icon: '🏢' },
                { id: 'asksuite', name: 'AskSuite', icon: '💬' },
                { id: 'bac_colones', name: 'BAC Colones', icon: '🏦' },
                { id: 'bac_dolares', name: 'BAC Dólares', icon: '💵' },
                { id: 'bcr_colones', name: 'BCR Colones', icon: '🏛️' },
                { id: 'bcr_dolares', name: 'BCR Dólares', icon: '💲' },
                { id: 'fideltour', name: 'Fideltour', icon: '🎯' },
                { id: 'greatdeals', name: 'GreatDeals', icon: '🎫' },
                { id: 'meta', name: 'Meta', icon: '📱' },
                { id: 'boxhere', name: 'BoxHere', icon: '📦' }
            ];"""

# Reemplazar
content = content.replace(old_sources, new_sources)

# Guardar
with open('/Users/apple/hotel_dashboard_raci/frontend_local/dashboard_completo.html', 'w') as f:
    f.write(content)

print("✅ Archivo actualizado con las 11 fuentes")
