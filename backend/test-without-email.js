require('dotenv').config({ path: '.env.local' });
const UniFiNetworkMonitor = require('./unifi-network-monitor');

async function testNoEmail() {
  console.log('🧪 Test monitor (senza email)...\n');
  
  const monitor = new UniFiNetworkMonitor({
    unifiApiKey: process.env.UNIFI_API_KEY
  });
  
  // Disabilita temporaneamente l'invio email
  monitor.sendAlertEmail = async () => {
    console.log('📧 [SIMULATO] Email di alert NON inviata');
  };
  
  // Esegui check
  await monitor.performHealthCheck();
  
  // Mostra i problemi rilevati
  const issues = monitor.metrics.current.issues;
  
  console.log('\n🔍 PROBLEMI RILEVATI:\n');
  
  console.log('❌ CRITICI:');
  issues.critical.forEach((issue, i) => {
    console.log(`\n${i+1}. ${issue.type}`);
    console.log(`   Problema: ${issue.message}`);
    console.log(`   Impatto: ${issue.impact}`);
    console.log(`   Soluzione: ${issue.solution}`);
  });
  
  console.log('\n⚠️  AVVISI:');
  issues.warning.forEach((issue, i) => {
    console.log(`\n${i+1}. ${issue.type}`);
    console.log(`   Problema: ${issue.message}`);
    console.log(`   Soluzione: ${issue.solution}`);
  });
  
  process.exit(0);
}

testNoEmail().catch(console.error);
