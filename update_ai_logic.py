# Leer el archivo
with open('/Users/apple/hotel_dashboard_raci/frontend_local/dashboard_completo.html', 'r') as f:
    content = f.read()

# Actualizar la función showDriveStatus para incluir la lógica de remitentes
old_examples = """html += '<p style="margin-top: 20px;"><strong>🎯 Última clasificación:</strong><br>';
            html += '"Contrato_Mantenimiento_Piscina.pdf" → Movido de Misceláneos a Mantenimiento<br>';
            html += '<small>Hace 15 minutos - Contexto aprendido de comentario en WhatsApp</small></p>';"""

new_examples = """html += '<h4 style="margin-top: 20px;">📧 Ejemplos de Clasificación por Remitente:</h4>';
            html += '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px;">';
            html += '<strong>✅ Alta Certeza (Auto-clasificados):</strong><br>';
            html += '• facturacion@terrazasdelcaribe.com → Finanzas (92%)<br>';
            html += '• reservas@booking.com → Reservas (95%)<br>';
            html += '• mantenimiento@poolservice.cr → Mantenimiento (88%)<br><br>';
            
            html += '<strong>⚠️ Certeza Media (Misceláneos + Sugerencia):</strong><br>';
            html += '• nuevo-proveedor@gmail.com + "limpieza" → Misceláneos (65%)<br>';
            html += '• consulta@empresa.com → Misceláneos (72%)<br><br>';
            
            html += '<strong>❓ Baja Certeza (Misceláneos + RACI "I"):</strong><br>';
            html += '• random123@hotmail.com → Misceláneos (35%)<br>';
            html += '• noreply@automated.com → Misceláneos (20%)<br>';
            html += '</div>';
            
            html += '<p style="margin-top: 20px;"><strong>🎯 Últimas clasificaciones:</strong></p>';
            html += '<div style="background: #e8f5e9; padding: 10px; border-radius: 6px; margin: 5px 0;">';
            html += '✅ "Factura_Abril_2025.pdf" de facturacion@ → <strong>Finanzas</strong> (95% certeza)<br>';
            html += '<small>Hace 5 minutos - Clasificación automática</small>';
            html += '</div>';
            
            html += '<div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin: 5px 0;">';
            html += '⚠️ "Propuesta_Servicios.pdf" de ventas@newcompany.cr → <strong>Misceláneos</strong> (68% certeza)<br>';
            html += '<small>Hace 12 minutos - Esperando contexto adicional</small>';
            html += '</div>';
            
            html += '<div style="background: #f8d7da; padding: 10px; border-radius: 6px; margin: 5px 0;">';
            html += '❓ "Document.pdf" de user9384@gmail.com → <strong>Misceláneos</strong> (25% certeza)<br>';
            html += '<small>Hace 20 minutos - RACI: Informado (I) para todos</small>';
            html += '</div>';"""

content = content.replace(old_examples, new_examples)

# Guardar
with open('/Users/apple/hotel_dashboard_raci/frontend_local/dashboard_completo.html', 'w') as f:
    f.write(content)

print("✅ Lógica AI actualizada con clasificación por remitente")
