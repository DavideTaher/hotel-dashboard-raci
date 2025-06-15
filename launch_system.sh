#!/bin/bash

# ============================================================================
# 🚀 LANZADOR SISTEMA COMPLETO - HOTEL DASHBOARD RACI
# ============================================================================

# Configuración
BASE_DIR="$HOME/hotel_dashboard_raci"
LOG_FILE="$BASE_DIR/logs/system_$(date +%Y%m%d).log"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Función para verificar si un puerto está ocupado
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Puerto ocupado
    else
        return 1  # Puerto libre
    fi
}

# Función para mostrar estado de servicios
show_status() {
    echo ""
    echo "📊 ESTADO DE SERVICIOS:"
    echo "======================="
    
    # Dashboard local
    if check_port 8080; then
        echo "✅ Dashboard (puerto 8080): FUNCIONANDO"
    else
        echo "❌ Dashboard (puerto 8080): DETENIDO"
    fi
    
    # Upload server
    if check_port 5001; then
        echo "✅ Upload Server (puerto 5001): FUNCIONANDO"
    else
        echo "❌ Upload Server (puerto 5001): DETENIDO"
    fi
    
    # Verificar logs recientes
    if [ -f "$LOG_FILE" ]; then
        local last_log=$(tail -1 "$LOG_FILE" 2>/dev/null)
        echo "📝 Último log: $last_log"
    fi
    
    # Verificar procesos de automatización
    local auto_processes=$(pgrep -f "automation_7x_system.py" | wc -l)
    echo "🤖 Procesos automatización: $auto_processes"
    
    echo ""
}

# Función para iniciar servicios
start_services() {
    log "🚀 INICIANDO SERVICIOS DEL SISTEMA"
    
    cd "$BASE_DIR"
    
    # 1. Iniciar dashboard local
    if ! check_port 8080; then
        log "📊 Iniciando dashboard local (puerto 8080)..."
        cd frontend_local
        python3 start_server.py &
        echo $! > ../logs/dashboard.pid
        cd ..
        sleep 2
        
        if check_port 8080; then
            log "✅ Dashboard iniciado correctamente"
        else
            log "❌ Error iniciando dashboard"
        fi
    else
        log "✅ Dashboard ya está funcionando"
    fi
    
    # 2. Iniciar upload server
    if ! check_port 5001; then
        log "📤 Iniciando upload server (puerto 5001)..."
        python3 upload_server.py &
        echo $! > logs/upload.pid
        sleep 2
        
        if check_port 5001; then
            log "✅ Upload server iniciado correctamente"
        else
            log "❌ Error iniciando upload server"
        fi
    else
        log "✅ Upload server ya está funcionando"
    fi
    
    # 3. Verificar sistema de automatización
    log "🤖 Verificando sistema de automatización..."
    python3 automation_7x_system.py run-once &
    local auto_pid=$!
    
    # Esperar un momento para verificar
    sleep 3
    if kill -0 $auto_pid 2>/dev/null; then
        log "✅ Sistema de automatización funcionando"
        wait $auto_pid  # Esperar a que termine
    else
        log "❌ Error en sistema de automatización"
    fi
    
    log "🎯 TODOS LOS SERVICIOS INICIADOS"
}

# Función para detener servicios
stop_services() {
    log "🛑 DETENIENDO SERVICIOS DEL SISTEMA"
    
    # Detener dashboard
    if [ -f "$BASE_DIR/logs/dashboard.pid" ]; then
        local pid=$(cat "$BASE_DIR/logs/dashboard.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            log "✅ Dashboard detenido"
        fi
        rm -f "$BASE_DIR/logs/dashboard.pid"
    fi
    
    # Detener upload server
    if [ -f "$BASE_DIR/logs/upload.pid" ]; then
        local pid=$(cat "$BASE_DIR/logs/upload.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            log "✅ Upload server detenido"
        fi
        rm -f "$BASE_DIR/logs/upload.pid"
    fi
    
    # Detener procesos de automatización
    pkill -f "automation_7x_system.py" 2>/dev/null
    log "✅ Procesos de automatización detenidos"
    
    log "🎯 TODOS LOS SERVICIOS DETENIDOS"
}

# Función para reiniciar servicios
restart_services() {
    log "🔄 REINICIANDO SERVICIOS DEL SISTEMA"
    stop_services
    sleep 2
    start_services
}

# Función para ejecutar backup completo
run_backup() {
    log "💾 EJECUTANDO BACKUP COMPLETO"
    cd "$BASE_DIR"
    ./auto_backup.sh backup
    if [ $? -eq 0 ]; then
        log "✅ Backup completado exitosamente"
    else
        log "❌ Error en backup"
    fi
}

# Función para testing completo
run_testing() {
    log "🧪 EJECUTANDO TESTING COMPLETO"
    
    cd "$BASE_DIR"
    
    # Test 1: Verificar archivos principales
    local files=("automation_7x_system.py" "auto_backup.sh" "components_memory_system.sh")
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            log "✅ Archivo encontrado: $file"
        else
            log "❌ Archivo faltante: $file"
        fi
    done
    
    # Test 2: Verificar componentes
    local component_count=$(ls -1 components_memory/*.md 2>/dev/null | wc -l)
    log "📁 Componentes encontrados: $component_count/10"
    
    # Test 3: Test de automatización
    log "🤖 Testing sistema de automatización..."
    python3 automation_7x_system.py run-once
    if [ $? -eq 0 ]; then
        log "✅ Sistema de automatización funcionando"
    else
        log "❌ Error en sistema de automatización"
    fi
    
    # Test 4: Verificar configuración
    if [ -f "automation_config.json" ]; then
        log "✅ Configuración encontrada"
    else
        log "❌ Configuración faltante"
    fi
    
    log "🎯 TESTING COMPLETADO"
}

# Función de menú interactivo
show_menu() {
    clear
    echo "🏨 HOTEL DASHBOARD RACI - SISTEMA DE CONTROL"
    echo "============================================="
    echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    show_status
    echo "OPCIONES DISPONIBLES:"
    echo "===================="
    echo "1. 🚀 Iniciar todos los servicios"
    echo "2. 🛑 Detener todos los servicios"  
    echo "3. 🔄 Reiniciar servicios"
    echo "4. 📊 Ver estado detallado"
    echo "5. 💾 Ejecutar backup completo"
    echo "6. 🤖 Ejecutar automatización manual"
    echo "7. 🧪 Ejecutar testing completo"
    echo "8. 📝 Ver logs recientes"
    echo "9. ⚙️ Configurar cron (automatización)"
    echo "0. ❌ Salir"
    echo ""
    echo -n "Selecciona una opción [0-9]: "
}

# Función principal
main() {
    # Crear directorio de logs si no existe
    mkdir -p "$BASE_DIR/logs"
    
    # Si se pasa argumento, ejecutar directamente
    case "$1" in
        "start")
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            show_status
            ;;
        "backup")
            run_backup
            ;;
        "test")
            run_testing
            ;;
        "auto")
            cd "$BASE_DIR"
            python3 automation_7x_system.py run-once
            ;;
        *)
            # Menú interactivo
            while true; do
                show_menu
                read -r choice
                
                case $choice in
                    1)
                        start_services
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    2)
                        stop_services
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    3)
                        restart_services
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    4)
                        show_status
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    5)
                        run_backup
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    6)
                        cd "$BASE_DIR"
                        python3 automation_7x_system.py run-once
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    7)
                        run_testing
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    8)
                        echo ""
                        echo "📝 LOGS RECIENTES:"
                        echo "=================="
                        tail -20 "$LOG_FILE" 2>/dev/null || echo "No hay logs disponibles"
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    9)
                        echo ""
                        echo "⚙️ CONFIGURANDO AUTOMATIZACIÓN CRON..."
                        if [ -f "$BASE_DIR/setup_cron.sh" ]; then
                            cd "$BASE_DIR"
                            ./setup_cron.sh
                        else
                            echo "❌ Script setup_cron.sh no encontrado"
                        fi
                        echo ""
                        echo "Presiona Enter para continuar..."
                        read -r
                        ;;
                    0)
                        log "👋 Sistema de control finalizado"
                        echo "¡Hasta luego!"
                        exit 0
                        ;;
                    *)
                        echo "❌ Opción inválida. Intenta de nuevo."
                        sleep 1
                        ;;
                esac
            done
            ;;
    esac
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$BASE_DIR" ]; then
    echo "❌ Error: Directorio $BASE_DIR no existe"
    echo "Asegúrate de que el proyecto esté en ~/hotel_dashboard_raci/"
    exit 1
fi

# Ejecutar función principal
main "$@"
