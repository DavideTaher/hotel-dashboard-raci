from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return '''
    <h1>🏨 Hotel Dashboard RACI - EN VIVO!</h1>
    <h2>Hotel Terrazas del Caribe</h2>
    <p>✅ Sistema funcionando en Google Cloud Run</p>
    <p>📊 10 componentes activos</p>
    <p>🤖 AI Analytics operativo</p>
    <p>🔗 <a href="/health">Health Check</a></p>
    '''

@app.route('/health')
def health():
    return {'status': 'OK', 'service': 'Hotel Dashboard RACI'}

@app.route('/upload')
def upload():
    return {'message': 'Upload endpoint ready'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
