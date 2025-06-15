#!/usr/bin/env python3
import subprocess
import requests
import json
import sys
from datetime import datetime

# Configuración
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

print("🏨 HOTEL TERRAZAS - PASSWORD DEFINITIVA (MÉTODO CORREGIDO)")
print("=" * 60)
print(f"📊 Total usuarios: {len(USERS)}")
print(f"🔑 Password DEFINITIVA: {NEW_PASSWORD}")
print(f"✅ SIN cambio obligatorio - OPERATIVA inmediatamente")
print("")

def get_access_token():
    """Obtener token de acceso de gcloud"""
    try:
        result = subprocess.run(
            ["gcloud", "auth", "print-access-token"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Error obteniendo token: {e}")
        return None

def change_password_requests(email, token):
    """Cambiar password usando requests"""
    try:
        url = f"https://admin.googleapis.com/admin/directory/v1/users/{email}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        data = {
            "password": NEW_PASSWORD,
            "changePasswordAtNextLogin": False,  # CRÍTICO: Password definitiva
            "suspended": False
        }
        
        response = requests.put(url, headers=headers, json=data)
        
        if response.status_code == 200:
            return True, "Password DEFINITIVA establecida"
        else:
            return False, f"HTTP {response.status_code}: {response.text}"
            
    except Exception as e:
        return False, f"Error: {e}"

# Verificar si requests está instalado
try:
    import requests
except ImportError:
    print("❌ Módulo 'requests' no encontrado")
    print("Instalando requests...")
    subprocess.run([sys.executable, "-m", "pip", "install", "requests"], check=True)
    import requests
    print("✅ Requests instalado")

# Obtener token de acceso
print("🔐 Obteniendo token de acceso...")
token = get_access_token()

if not token:
    print("❌ No se pudo obtener token de acceso")
    sys.exit(1)

print("✅ Token obtenido correctamente")
print("")

# Procesar usuarios
for i, email in enumerate(USERS, 1):
    print(f"[{i:2d}/{len(USERS)}] 🔑 {email:<35}", end=" ")
    
    success, message = change_password_requests(email, token)
    
    if success:
        print(f"✅ {message}")
        successful.append(email)
    else:
        print(f"❌ {message}")
        failed.append(email)

print(f"\n📊 RESUMEN FINAL:")
print(f"✅ Passwords DEFINITIVAS: {len(successful)}")
print(f"❌ Errores: {len(failed)}")

if successful:
    print(f"\n✅ USUARIOS OPERATIVOS CON {NEW_PASSWORD}:")
    for user in successful:
        print(f"  ✓ {user}")

if failed:
    print(f"\n❌ USUARIOS CON ERRORES:")
    for user in failed:
        print(f"  ✗ {user}")

print(f"\n🎉 CAMBIO COMPLETADO")
