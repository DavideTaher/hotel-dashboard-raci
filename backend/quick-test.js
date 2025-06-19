require('dotenv').config({ path: '.env.local' });
const UniFiNetworkMonitor = require('./unifi-network-monitor');

async function quickTest() {
  console.log('🧪 Test rapido del monitor...\n');
  
  const monitor = new UniFiNetworkMonitor({
    unifiApiKey: process.env.UNIFI_API_KEY
  });
  
  // Forza un check immediato
  console.log('📍 Eseguo health check immediato...');
  await monitor.performHealthCheck();
  
  console.log('\n✅ Test completato!');
  console.log('📧 Controlla la tua email per eventuali alert');
  
  // Mostra lo stato corrente
  const status = monitor.getStatus();
  console.log('\n📊 Stato attuale:');
  console.log('- Status:', status.summary.status);
  console.log('- Latenza:', status.summary.latency + 'ms');
  console.log('- Problemi critici:', status.summary.issues.critical);
  console.log('- Avvisi:', status.summary.issues.warning);
  
  process.exit(0);
}

quickTest().catch(console.error);
