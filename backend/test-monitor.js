require('dotenv').config({ path: '.env.local' });

console.log('🔍 Test delle credenziali...');
console.log('✓ API Key presente:', !!process.env.UNIFI_API_KEY);
console.log('✓ Email configurata:', process.env.EMAIL_FROM);
console.log('✓ Password email presente:', !!process.env.EMAIL_APP_PASSWORD);

// Test connessione UniFi
const axios = require('axios');

async function testUniFi() {
  try {
    const response = await axios.get(
      'https://api.ui.com/ea/hosts/E063DA8A507D00000000047614FD0000000004A787AB000000005E21E316:1720904814',
      {
        headers: {
          'x-api-key': process.env.UNIFI_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );
    console.log('✅ Connessione UniFi riuscita!');
    console.log('   Controller:', response.data.type);
  } catch (error) {
    console.log('❌ Errore connessione UniFi:', error.message);
    console.log('   Verifica la tua API key');
  }
}

testUniFi();
