import os
import requests
from flask import Flask, jsonify, send_from_directory, send_file
from datetime import datetime

app = Flask(__name__)

# Serve React frontend
@app.route('/')
def serve_index():
    """Serve React app main page"""
    return send_file('frontend/dist/index.html')

@app.route('/dashboard')
def serve_dashboard():
    """Serve React dashboard with NetworkStatus integration"""
    return send_file('frontend/dist/index.html')

@app.route('/upload')  
def serve_upload():
    """Serve React upload page"""
    return send_file('frontend/dist/index.html')

@app.route('/analytics')
def serve_analytics():
    """Serve React analytics page"""
    return send_file('frontend/dist/index.html')

# Serve static assets (CSS, JS, images)
@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve React build assets"""
    return send_from_directory('frontend/dist/assets', path)

@app.route('/vite.svg')
def serve_vite():
    """Serve vite.svg"""
    return send_from_directory('frontend/dist', 'vite.svg')

# API Routes
@app.route('/api/dashboard/stats')
def api_dashboard_stats():
    """API endpoint for dashboard statistics"""
    return jsonify({
        'totalDepartments': 8,
        'activeProcesses': 25,
        'totalMessages24h': 147,
        'sentimentScore': 0.89,
        'lastUpdate': datetime.now().isoformat()
    })

@app.route('/api/whatsapp/recent')
def api_whatsapp_recent():
    """API endpoint for WhatsApp activity"""
    return jsonify({
        'messages': [
            {
                'dept': 'Recepción',
                'message': 'Check-in completado hab 205',
                'user': 'Ana García',
                'time': '10:30'
            },
            {
                'dept': 'Housekeeping', 
                'message': 'Limpieza finalizada piso 3',
                'user': 'María López',
                'time': '10:15'
            },
            {
                'dept': 'Mantenimiento',
                'message': 'AC reparado hab 312',
                'user': 'Carlos Ruiz',
                'time': '09:45'
            }
        ]
    })

@app.route('/api/network/status')
def api_network_status():
    """Proxy endpoint for network status to avoid CORS"""
    try:
        response = requests.get('https://network-monitor-dot-hotel-terrazas-ai-system.uc.r.appspot.com/api/network/status', timeout=10)
        return response.json()
    except Exception as e:
        return jsonify({
            'error': 'Network API unavailable', 
            'status': 'UNKNOWN',
            'current': {'status': 'UNKNOWN', 'issues': {'critical': 0, 'warning': 0}},
            'summary': {'status': 'UNKNOWN', 'latency': 0, 'issues': {'critical': 0, 'warning': 0}}
        })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Hotel Dashboard RACI',
        'version': '4.1 - NETWORK API INTEGRATED',
        'hotel': 'Terrazas del Caribe',
        'frontend': 'React with NetworkStatus + RACI',
        'backend': 'Flask with Network Proxy',
        'components': 10,
        'data_processed': '186MB',
        'last_update': datetime.now().isoformat()
    })

# Catch-all route for React Router (DEVE ESSERE ULTIMO)
@app.route('/<path:path>')
def serve_react_routes(path):
    """Serve React app for all other routes (React Router)"""
    # Check if file exists in static assets
    static_file_path = f'frontend/dist/{path}'
    if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
        return send_from_directory('frontend/dist', path)
    
    # Otherwise serve React app (for client-side routing)
    return send_file('frontend/dist/index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
