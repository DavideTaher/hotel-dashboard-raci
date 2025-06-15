from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import re
from datetime import datetime, timedelta
import pandas as pd
from collections import defaultdict

app = Flask(__name__)
CORS(app)

class WhatsAppProcessor:
    def __init__(self):
        # Simulación de datos para Cloud Run (sin acceso a archivos locales)
        self.departments = {
            'Fran Seguridad': 'Seguridad',
            'Terrazas Del Caribe 83': 'Recepción',
            'Manfred Bolívar': 'Mantenimiento',
            'General TDC LDC': 'General'
        }
        
    def analyze_sentiment_basic(self, message):
        positive_words = ['bien', 'bueno', 'excelente', 'perfecto', 'gracias', 'ok']
        negative_words = ['problema', 'error', 'malo', 'urgente']
        
        message_lower = message.lower()
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        
        if positive_count > negative_count:
            return 0.7
        elif negative_count > positive_count:
            return 0.3
        else:
            return 0.5
    
    def get_recent_activity(self, hours=24):
        # Datos simulados para Cloud Run
        return [
            {
                'timestamp': datetime.now().isoformat(),
                'user': 'Terrazas Del Caribe 83',
                'message': 'habitaciones 3 y 9 extienden una noche',
                'department': 'Recepción',
                'sentiment': 0.5
            },
            {
                'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
                'user': 'Fran Seguridad',
                'message': 'Todo tranquilo en el turno nocturno',
                'department': 'Seguridad', 
                'sentiment': 0.7
            }
        ]

whatsapp_processor = WhatsAppProcessor()

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'Hotel Dashboard API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({
        'status': 'ok',
        'message': 'Hotel Dashboard API funcionando',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        recent_activity = whatsapp_processor.get_recent_activity()
        
        total_messages = len(recent_activity)
        avg_sentiment = sum(msg['sentiment'] for msg in recent_activity) / max(total_messages, 1)
        
        dept_activity = defaultdict(int)
        for msg in recent_activity:
            dept_activity[msg['department']] += 1
            
        stats = {
            'totalDepartments': 12,
            'activeProcesses': 45,
            'completedTasks': 128,
            'pendingAlerts': 3,
            'sentimentScore': avg_sentiment,
            'lastUpdate': datetime.now().isoformat(),
            'totalMessages24h': total_messages,
            'departmentActivity': dict(dept_activity)
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/whatsapp/recent', methods=['GET'])
def get_recent_whatsapp():
    try:
        hours = request.args.get('hours', 24, type=int)
        messages = whatsapp_processor.get_recent_activity(hours)
        
        formatted_messages = []
        for msg in messages:
            dt = datetime.fromisoformat(msg['timestamp'])
            formatted_messages.append({
                'time': dt.strftime('%H:%M'),
                'dept': msg['department'],
                'user': msg['user'],
                'message': msg['message'],
                'sentiment': msg['sentiment'],
                'timestamp': msg['timestamp']
            })
            
        return jsonify({
            'messages': formatted_messages,
            'total': len(formatted_messages),
            'period_hours': hours
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/raci/matrix', methods=['GET'])
def get_raci_matrix():
    matrix = {
        'Front Office': {
            'Check-in/out Process': 'R',
            'Guest Complaints': 'R',
            'Room Cleaning': 'I',
            'Emergency Response': 'C'
        },
        'Housekeeping': {
            'Room Cleaning': 'R',
            'Check-in/out Process': 'C',
            'Guest Complaints': 'C',
            'Emergency Response': 'I'
        },
        'Seguridad': {
            'Emergency Response': 'R',
            'Check-in/out Process': 'I',
            'Room Cleaning': 'I',
            'Guest Complaints': 'C'
        },
        'Mantenimiento': {
            'Maintenance Requests': 'R',
            'Emergency Response': 'C',
            'Room Cleaning': 'C',
            'Check-in/out Process': 'I'
        }
    }
    
    return jsonify({
        'matrix': matrix,
        'last_updated': datetime.now().isoformat(),
        'departments': list(matrix.keys()),
        'processes': list(set().union(*(d.keys() for d in matrix.values())))
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
