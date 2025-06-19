require('dotenv').config({ path: '.env.local' });
const UniFiNetworkMonitor = require('./unifi-network-monitor');

console.log('🚀 Avvio UniFi Network Monitor...');
console.log('📧 Email reports to:', process.env.EMAIL_FROM);
console.log('🔄 Check interval: 5 minutes');
console.log('📊 Daily report: 8:00 AM');
console.log('');

// Inizializza il monitor
const monitor = new UniFiNetworkMonitor({
  unifiApiKey: process.env.UNIFI_API_KEY
});

// Crea semplici API endpoints
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Endpoint per lo stato
app.get('/api/network/status', (req, res) => {
  res.json(monitor.getStatus());
});

// Endpoint per la storia
app.get('/api/network/history', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  res.json(monitor.getHistory(hours));
});

// Endpoint per i dispositivi
app.get('/api/network/devices', (req, res) => {
  res.json(monitor.getDeviceStatus());
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Avvia il server
app.listen(port, () => {
  console.log(`🌐 Server attivo sulla porta ${port}`);
});

// Gestisci chiusura pulita
process.on('SIGINT', () => {
  console.log('\n🛑 Arresto monitor...');
  process.exit(0);
});
