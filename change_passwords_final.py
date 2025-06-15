#!/usr/bin/env python3
import subprocess
import json
import sys
from datetime import datetime

# Configuración para password DEFINITIVA
USERS = [
    "CEO@terrazasdelcaribe.com",
    "CFO@terrazasdelcaribe.com", 
    "CFOassistant@terrazasdelcaribe.com",
    "Concierge@terrazasdelcaribe.com",
    "COO@terrazasdelcaribe.com",
    "CSGE@terrazasdelcaribe.com",
    "FDK@terrazasdelcaribe.com",
    "FNDB@terrazasdelcaribe.com",
    "HKG@terrazasdelcaribe.com",
    "Maintenances@terrazasdelcaribe.com",
    "MKTG@terrazasdelcaribe.com",
    "SCTY@terrazasdelcaribe.com"
]

NEW_PASSWORD = "TDC2025AI$#@!"
successful = []
failed = []

print("🏨 HOTEL TERRAZAS - PASSWORD DEFINITIVA OPERATIVA")
print("=" * 55)
print(f"📊 Total usuarios: {len(USERS)}")
print(f"🔑 Password DEFINITIVA: {NEW_PASSWORD}")
print(f"✅ SIN cambio obligatorio - OPERATIVA inmediatamente")
print(f"🚫 DESHABILITADO changePasswordAtNextLogin")
print("")

def change_user_password_final(email):
    """Cambiar password de forma DEFINITIVA - sin más cambios forzados"""
    try:
        # Comando para cambiar password SIN forzar cambio adicional
        cmd = [
            "curl", "-X", "PUT",
            f"https://admin.googleapis.com/admin/directory/v1/users/{email}",
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer $(gcloud auth print-access-token)",
            "-d", json.dumps({
                "password": NEW_PASSWORD,
                "changePasswordAtNextLogin": False,  # CRÍTICO: No forzar más cambios
                "suspended": False,                   # Asegurar que esté activo
                "archived": False                     # Asegurar que no esté archivado
            })
        ]
        
        # Ejecutar comando
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        
        if result.returncode == 0:
            return True, "Password cambiada - OPERATIVA"
        else:
            return False, f"Error: {result.stderr}"
            
    except Exception as e:
        return False, f"Excepción: {e}"

# Procesamiento de usuarios
for i, email in enumerate(USERS, 1):
    print(f"[{i:2d}/{len(USERS)}] 🔑 {email:<35}", end=" ")
    
    success, message = change_user_password_final(email)
    
    if success:
        print(f"✅ {message}")
        successful.append(email)
    else:
        print(f"❌ {message}")
        failed.append(email)

print(f"\n📊 RESUMEN FINAL:")
print(f"✅ Passwords DEFINITIVAS establecidas: {len(successful)}")
print(f"❌ Errores: {len(failed)}")
print(f"🔑 Password operativa: {NEW_PASSWORD}")
print(f"✅ Acceso inmediato SIN más cambios")

# Lista de usuarios exitosos
if successful:
    print(f"\n✅ USUARIOS CON PASSWORD OPERATIVA:")
    for user in successful:
        print(f"  ✓ {user} → {NEW_PASSWORD}")

if failed:
    print(f"\n❌ USUARIOS QUE NECESITAN REVISIÓN:")
    for user in failed:
        print(f"  ✗ {user}")

print(f"\n🎉 SISTEMA LISTO - PASSWORDS OPERATIVAS DEFINITIVAS")
