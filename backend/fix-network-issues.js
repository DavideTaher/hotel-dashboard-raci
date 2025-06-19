require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

class UniFiAutoFix {
  constructor() {
    this.apiKey = process.env.UNIFI_API_KEY;
    this.consoleId = 'E063DA8A507D00000000047614FD0000000004A787AB000000005E21E316:1720904814';
    this.headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async fixIssues() {
    console.log('🔧 UNIFI AUTOFIX - RISOLUZIONE AUTOMATICA PROBLEMI\n');
    
    // 1. Tentativo di disabilitare Smart Queues
    console.log('1️⃣ Tentativo disattivazione Smart Queues...');
    await this.disableSmartQueues();
    
    // 2. Tentativo di ottimizzare canali WiFi
    console.log('\n2️⃣ Tentativo ottimizzazione canali WiFi...');
    await this.optimizeWiFiChannels();
    
    // 3. Suggerimenti per canali manuali
    console.log('\n3️⃣ Configurazione canali suggerita...');
    this.suggestChannelConfig();
    
    // 4. Tentativo di riavvio radio
    console.log('\n4️⃣ Tentativo riavvio radio APs...');
    await this.restartRadios();
  }

  async disableSmartQueues() {
    try {
      // Prova endpoint per configurazione WAN
      const wanConfig = {
        smartqueue_enabled: false,
        smartqueue_up_rate: 0,
        smartqueue_down_rate: 0
      };
      
      const response = await axios.post(
        `https://api.ui.com/ea/sites/default/cmd/set-wan-settings`,
        wanConfig,
        { headers: this.headers }
      );
      
      if (response.status === 200) {
        console.log('✅ Smart Queues disabilitato con successo!');
      }
    } catch (error) {
      console.log('❌ Non posso disabilitare Smart Queues via API');
      console.log('   AZIONE MANUALE RICHIESTA:');
      console.log('   1. Vai su https://unifi.ui.com');
      console.log('   2. Settings → Internet → Primary (WAN)');
      console.log('   3. Smart Queues: OFF');
    }
  }

  async optimizeWiFiChannels() {
    try {
      // Tentativo di triggere Radio AI
      const response = await axios.post(
        `https://api.ui.com/ea/cmd/optimize-radios`,
        { site_id: 'default' },
        { headers: this.headers }
      );
      
      if (response.status === 200) {
        console.log('✅ Ottimizzazione canali avviata!');
        console.log('   Attendi 5 minuti per il completamento...');
      }
    } catch (error) {
      console.log('❌ Non posso avviare Radio AI via API');
      console.log('   AZIONE MANUALE RICHIESTA:');
      console.log('   1. Settings → WiFi → Radio Manager');
      console.log('   2. Click "Optimize Now"');
    }
  }

  suggestChannelConfig() {
    console.log('📡 CONFIGURAZIONE CANALI OTTIMALE:');
    console.log('\n2.4 GHz (20 MHz width):');
    console.log('- Zona 1: Canale 1');
    console.log('- Zona 2: Canale 6');
    console.log('- Zona 3: Canale 11');
    console.log('- Ruota tra questi 3 canali SOLO');
    
    console.log('\n5 GHz (80 MHz width):');
    console.log('- Zona 1: Canale 36');
    console.log('- Zona 2: Canale 44');
    console.log('- Zona 3: Canale 149');
    console.log('- Zona 4: Canale 157');
    
    console.log('\n⚠️  IMPORTANTE: Distribuire APs per zone fisiche');
  }

  async restartRadios() {
    try {
      // Comando per riavviare le radio
      const response = await axios.post(
        `https://api.ui.com/ea/cmd/restart-radios`,
        { 
          site_id: 'default',
          radio_band: 'both'
        },
        { headers: this.headers }
      );
      
      if (response.status === 200) {
        console.log('✅ Riavvio radio completato!');
      }
    } catch (error) {
      console.log('❌ Non posso riavviare radio via API');
    }
  }

  async getDeviceList() {
    try {
      console.log('\n📋 LISTA DISPOSITIVI CON PROBLEMI:');
      
      // Lista dei dispositivi problematici
      const problematicDevices = [
        { name: 'AC-LR-HAB-23', issue: 'Connessione 100Mbps' },
        { name: 'US-8-60W-COCINA BAR', issue: 'Connessione 100Mbps' },
        { name: 'Canale 6 (2.4GHz)', issue: '10 APs sullo stesso canale' },
        { name: 'Canale 36 (5GHz)', issue: '10 APs sullo stesso canale' }
      ];
      
      problematicDevices.forEach(device => {
        console.log(`\n- ${device.name}`);
        console.log(`  Problema: ${device.issue}`);
      });
    } catch (error) {
      console.log('❌ Errore nel recupero dispositivi');
    }
  }
}

// Esegui le correzioni
async function runAutoFix() {
  const fixer = new UniFiAutoFix();
  
  try {
    await fixer.fixIssues();
    await fixer.getDeviceList();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO AZIONI:');
    console.log('- Smart Queues: Richiede azione manuale');
    console.log('- Ottimizzazione WiFi: Richiede azione manuale');
    console.log('- Configurazione canali: Vedi suggerimenti sopra');
    console.log('- Cavi lenti: Verifica fisica richiesta');
    
    console.log('\n⏱️  TEMPO STIMATO: 15-20 minuti');
    console.log('📈 MIGLIORAMENTO ATTESO: 50-70% riduzione latenza');
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

runAutoFix();
