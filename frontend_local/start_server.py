#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import threading
import time

PORT = 8080

def start_server():
    with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
        print(f"🌐 Servidor iniciado en http://localhost:{PORT}")
        httpd.serve_forever()

def open_browser():
    time.sleep(2)
    webbrowser.open(f'http://localhost:{PORT}')

if __name__ == "__main__":
    print("🚀 Iniciando Hotel Dashboard RACI - Servidor Local")
    
    # Iniciar servidor en un hilo separado
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Abrir navegador
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    try:
        print("📊 Dashboard disponible en: http://localhost:8080")
        print("❌ Presiona Ctrl+C para detener el servidor")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")
