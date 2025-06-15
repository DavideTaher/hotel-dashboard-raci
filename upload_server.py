#!/usr/bin/env python3
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import shutil
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=['http://localhost:8080'])

BASE_DIR = os.path.expanduser("~/hotel_dashboard_raci/daily_exports")
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'json'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload/<source>', methods=['POST', 'OPTIONS'])
def upload_file(source):
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            incoming_dir = os.path.join(BASE_DIR, source, 'incoming')
            os.makedirs(incoming_dir, exist_ok=True)
            
            filepath = os.path.join(incoming_dir, filename)
            file.save(filepath)
            
            os.system(f'cd {os.path.expanduser("~/hotel_dashboard_raci")} && python3 scripts/analyze_exports_full.py')
            
            return jsonify({
                'success': True,
                'message': f'Archivo {filename} cargado y procesado',
                'source': source
            })
        else:
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    try:
        json_path = os.path.join(BASE_DIR, 'dashboard_data', 'incremental_analysis.json')
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                data = json.load(f)
            return jsonify(data)
        return jsonify({'error': 'No data available'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Servidor de uploads iniciado en http://localhost:5001")
    app.run(debug=True, port=5001)
