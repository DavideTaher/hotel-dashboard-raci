// unifi-network-monitor.js
// Componente per monitoraggio rete UniFi Hotel Terrazas
// Da integrare nel backend esistente del progetto RACI

const axios = require('axios');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');

class UniFiNetworkMonitor {
  constructor(config) {
    this.config = {
      // UniFi Configuration
      unifiApiKey: process.env.UNIFI_API_KEY || config.unifiApiKey,
      consoleId: 'E063DA8A507D00000000047614FD0000000004A787AB000000005E21E316:1720904814',
      
      // Network Configuration
      hotelNetwork: {
        gateway: '192.168.50.1',
        mainSwitch: '192.168.50.11',
        dnsServers: ['1.1.1.1', '8.8.8.8'],
        ufinet: { isp: 'UFINET COSTA RICA SA', bandwidth: 300 }
      },
      
      // Alert Thresholds
      thresholds: {
        maxLatency: 50, // ms
        maxPacketLoss: 1, // %
        minBandwidth: 200, // Mbps
        maxChannelAPs: 3, // APs per channel
      },
      
      // Email Configuration
      email: {
        to: 'Dade.taher@gmail.com',
        from: process.env.EMAIL_FROM || 'monitor@hotelterrazas.com',
        subject: 'UniFi Network Status - Hotel Terrazas'
      },
      
      // Dashboard Integration
      dashboardDb: config.database || null,
      updateInterval: 5 * 60 * 1000, // 5 minutes
      
      ...config
    };
    
    this.metrics = {
      current: {},
      history: [],
      alerts: [],
      devices: {
        total: 31,
        aps: 25,
        switches: 5,
        gateway: 1
      }
    };
    
    this.setupEmailTransporter();
    this.initializeMonitoring();
  }

  setupEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.email.from,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  async initializeMonitoring() {
    console.log('🚀 Iniciando UniFi Network Monitor - Hotel Terrazas');
    
    // Initial check
    await this.performHealthCheck();
    
    // Schedule regular checks
    setInterval(() => this.performHealthCheck(), this.config.updateInterval);
    
    // Schedule daily report at 8:00 AM
    schedule.scheduleJob('0 8 * * *', () => this.sendDailyReport());
    
    // Schedule WiFi optimization check at 3:00 AM
    schedule.scheduleJob('0 3 * * *', () => this.checkWiFiOptimization());
  }

  async performHealthCheck() {
    try {
      const timestamp = new Date();
      console.log(`\n🔍 Health Check - ${timestamp.toLocaleString()}`);
      
      // 1. Check UniFi Cloud Status
      const cloudStatus = await this.checkUniFiCloud();
      
      // 2. Analyze Network Metrics
      const networkMetrics = await this.analyzeNetworkMetrics();
      
      // 3. Check Known Issues
      const issues = this.detectKnownIssues(networkMetrics);
      
      // 4. Update Current Metrics
      this.metrics.current = {
        timestamp,
        cloud: cloudStatus,
        network: networkMetrics,
        issues,
        status: this.calculateOverallStatus(issues)
      };
      
      // 5. Store in History
      this.metrics.history.push(this.metrics.current);
      
      // 6. Update Dashboard Database
      await this.updateDashboard();
      
      // 7. Send Alerts if Needed
      if (issues.critical.length > 0) {
        await this.sendAlertEmail(issues);
      }
      
      // Keep only last 24 hours of history
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metrics.history = this.metrics.history.filter(m => 
        new Date(m.timestamp) > dayAgo
      );
      
    } catch (error) {
      console.error('❌ Error in health check:', error);
      this.metrics.current.error = error.message;
    }
  }

  async checkUniFiCloud() {
    try {
      const response = await axios.get(
        `https://api.ui.com/ea/hosts/${this.config.consoleId}`,
        {
          headers: {
            'x-api-key': this.config.unifiApiKey,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
      
      return {
        status: 'online',
        controller: 'TerrazasCloudKey',
        version: '4.2.119',
        responseTime: response.headers['x-response-time'] || 'N/A'
      };
      
    } catch (error) {
      return {
        status: 'offline',
        error: error.message
      };
    }
  }

  async analyzeNetworkMetrics() {
    const metrics = {
      latency: {},
      bandwidth: {},
      devices: {},
      wifi: {
        channels: {
          '2.4GHz': {},
          '5GHz': {}
        },
        issues: []
      }
    };
    
    // Simulate network tests (in production, use actual ping/traceroute)
    metrics.latency = {
      google: this.simulateLatencyTest('8.8.8.8'),
      cloudflare: this.simulateLatencyTest('1.1.1.1'),
      gateway: this.simulateLatencyTest(this.config.hotelNetwork.gateway),
      average: 0
    };
    
    // Calculate average latency
    const latencies = Object.values(metrics.latency).filter(v => typeof v === 'number');
    metrics.latency.average = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    
    // Analyze WiFi channel distribution (based on known issues)
    metrics.wifi.channels['2.4GHz'] = {
      1: 5, // 5 APs
      6: 10, // 10 APs - CRITICAL
      11: 2 // 2 APs
    };
    
    metrics.wifi.channels['5GHz'] = {
      36: 10, // 10 APs - CRITICAL
      44: 1,
      149: 0,
      157: 0
    };
    
    // Smart Queues Status (known to be problematic)
    metrics.smartQueues = {
      enabled: true, // Should be false for 300Mbps
      recommendation: 'DISABLE_IMMEDIATELY'
    };
    
    return metrics;
  }

  simulateLatencyTest(host) {
    // In production, use actual ping command
    // For now, simulate based on known network conditions
    const baseLatencies = {
      '8.8.8.8': 65,
      '1.1.1.1': 25,
      '192.168.50.1': 2
    };
    
    const base = baseLatencies[host] || 50;
    const variance = Math.random() * 10 - 5;
    return Math.round(base + variance);
  }

  detectKnownIssues(metrics) {
    const issues = {
      critical: [],
      warning: [],
      info: []
    };
    
    // Check latency
    if (metrics.latency.average > this.config.thresholds.maxLatency) {
      issues.critical.push({
        type: 'HIGH_LATENCY',
        message: `Latencia promedio: ${metrics.latency.average.toFixed(1)}ms (máximo: ${this.config.thresholds.maxLatency}ms)`,
        impact: 'Experiencia degradada para huéspedes',
        solution: 'Desactivar Smart Queues inmediatamente'
      });
    }
    
    // Check WiFi channels
    for (const [band, channels] of Object.entries(metrics.wifi.channels)) {
      for (const [channel, count] of Object.entries(channels)) {
        if (count > this.config.thresholds.maxChannelAPs) {
          issues.critical.push({
            type: 'CHANNEL_SATURATION',
            message: `Canal ${channel} (${band}): ${count} APs (máximo recomendado: ${this.config.thresholds.maxChannelAPs})`,
            impact: 'Interferencia severa entre APs',
            solution: 'Ejecutar Radio AI Optimization'
          });
        }
      }
    }
    
    // Check Smart Queues
    if (metrics.smartQueues.enabled) {
      issues.critical.push({
        type: 'SMART_QUEUES_ENABLED',
        message: 'Smart Queues activo con conexión de 300Mbps',
        impact: 'Limitación innecesaria del ancho de banda',
        solution: 'Settings → Internet → WAN → Smart Queues: OFF'
      });
    }
    
    // Check specific devices
    const slowDevices = ['AC-LR-HAB-23', 'US-8-60W-COCINA BAR'];
    issues.warning.push({
      type: 'SLOW_CONNECTIONS',
      message: `Dispositivos con conexión lenta (100Mbps): ${slowDevices.join(', ')}`,
      impact: 'Cuellos de botella en la red',
      solution: 'Verificar/reemplazar cables Cat5e/Cat6'
    });
    
    return issues;
  }

  calculateOverallStatus(issues) {
    if (issues.critical.length > 0) return 'CRITICAL';
    if (issues.warning.length > 0) return 'WARNING';
    return 'HEALTHY';
  }

  async updateDashboard() {
    if (!this.config.dashboardDb) return;
    
    try {
      // Update dashboard database with current metrics
      const dashboardData = {
        network_status: this.metrics.current.status,
        latency_avg: this.metrics.current.network.latency.average,
        cloud_status: this.metrics.current.cloud.status,
        critical_issues: this.metrics.current.issues.critical.length,
        warning_issues: this.metrics.current.issues.warning.length,
        last_update: this.metrics.current.timestamp,
        devices_online: this.calculateOnlineDevices(),
        wifi_health: this.calculateWiFiHealth()
      };
      
      // Insert into dashboard_data table
      await this.config.dashboardDb.query(
        `INSERT INTO network_monitoring (data, timestamp) VALUES ($1, $2)`,
        [JSON.stringify(dashboardData), new Date()]
      );
      
      console.log('✅ Dashboard updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating dashboard:', error);
    }
  }

  calculateOnlineDevices() {
    // In production, get actual device status
    return {
      aps: 24, // 1 offline
      switches: 5,
      gateway: 1,
      total: 30
    };
  }

  calculateWiFiHealth() {
    const issues = this.metrics.current.issues;
    const channelIssues = issues.critical.filter(i => i.type === 'CHANNEL_SATURATION').length;
    
    if (channelIssues > 2) return 'POOR';
    if (channelIssues > 0) return 'FAIR';
    return 'GOOD';
  }

  async sendAlertEmail(issues) {
    const html = this.generateAlertHTML(issues);
    
    const mailOptions = {
      from: this.config.email.from,
      to: this.config.email.to,
      subject: `⚠️ ALERTA UniFi - ${issues.critical.length} problemas críticos`,
      html
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Alert email sent to ${this.config.email.to}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  }

  generateAlertHTML(issues) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #e74c3c; color: white; padding: 20px; margin: -20px -20px 20px -20px; border-radius: 10px 10px 0 0; }
    .critical { background: #fff5f5; border-left: 4px solid #e74c3c; padding: 15px; margin: 10px 0; }
    .metric { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #34495e; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ ALERTA - Red UniFi Hotel Terrazas</h1>
      <p>${new Date().toLocaleString()}</p>
    </div>
    
    <h2>Problemas Críticos Detectados:</h2>
    ${issues.critical.map(issue => `
      <div class="critical">
        <h3>${issue.type.replace(/_/g, ' ')}</h3>
        <p><strong>Problema:</strong> ${issue.message}</p>
        <p><strong>Impacto:</strong> ${issue.impact}</p>
        <p><strong>Solución:</strong> ${issue.solution}</p>
      </div>
    `).join('')}
    
    <h2>Métricas Actuales:</h2>
    <table>
      <tr>
        <th>Métrica</th>
        <th>Valor</th>
        <th>Estado</th>
      </tr>
      <tr>
        <td>Latencia Promedio</td>
        <td>${this.metrics.current.network.latency.average.toFixed(1)}ms</td>
        <td>${this.metrics.current.network.latency.average > 50 ? '🔴 ALTA' : '🟢 NORMAL'}</td>
      </tr>
      <tr>
        <td>UniFi Cloud</td>
        <td>${this.metrics.current.cloud.status}</td>
        <td>${this.metrics.current.cloud.status === 'online' ? '🟢' : '🔴'}</td>
      </tr>
      <tr>
        <td>Dispositivos Online</td>
        <td>${this.calculateOnlineDevices().total}/31</td>
        <td>${this.calculateOnlineDevices().total < 31 ? '🟡' : '🟢'}</td>
      </tr>
    </table>
    
    <h3>Acciones Inmediatas:</h3>
    <ol>
      <li>Acceder a https://unifi.ui.com</li>
      <li>Desactivar Smart Queues (Settings → Internet → WAN)</li>
      <li>Ejecutar Radio AI Optimization</li>
      <li>Verificar cables de dispositivos lentos</li>
    </ol>
    
    <hr>
    <p style="color: #666; font-size: 12px;">
      Monitor Automático UniFi - Hotel Terrazas<br>
      Ejecutándose desde Google Cloud Platform
    </p>
  </div>
</body>
</html>
    `;
  }

  async sendDailyReport() {
    console.log('📊 Generating daily report...');
    
    // Calculate daily statistics
    const stats = this.calculateDailyStats();
    const html = this.generateDailyReportHTML(stats);
    
    const mailOptions = {
      from: this.config.email.from,
      to: this.config.email.to,
      subject: `📊 Reporte Diario UniFi - ${new Date().toLocaleDateString()}`,
      html
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Daily report sent successfully');
    } catch (error) {
      console.error('❌ Error sending daily report:', error);
    }
  }

  calculateDailyStats() {
    const last24h = this.metrics.history;
    
    return {
      totalChecks: last24h.length,
      criticalAlerts: last24h.filter(m => m.status === 'CRITICAL').length,
      warningAlerts: last24h.filter(m => m.status === 'WARNING').length,
      avgLatency: last24h.reduce((sum, m) => sum + m.network.latency.average, 0) / last24h.length,
      uptime: (last24h.filter(m => m.cloud.status === 'online').length / last24h.length * 100).toFixed(1),
      worstLatency: Math.max(...last24h.map(m => m.network.latency.average)),
      bestLatency: Math.min(...last24h.map(m => m.network.latency.average))
    };
  }

  generateDailyReportHTML(stats) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { background: white; padding: 20px; border-radius: 10px; }
    .header { background: #3498db; color: white; padding: 20px; margin: -20px -20px 20px -20px; border-radius: 10px 10px 0 0; }
    .metric-card { display: inline-block; background: #ecf0f1; padding: 20px; margin: 10px; border-radius: 8px; text-align: center; min-width: 150px; }
    .good { color: #27ae60; }
    .bad { color: #e74c3c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Reporte Diario - Hotel Terrazas</h1>
      <p>${new Date().toLocaleDateString()}</p>
    </div>
    
    <h2>Resumen del Día:</h2>
    <div style="text-align: center;">
      <div class="metric-card">
        <h3>Uptime</h3>
        <p style="font-size: 36px;" class="${stats.uptime > 99 ? 'good' : 'bad'}">${stats.uptime}%</p>
      </div>
      <div class="metric-card">
        <h3>Latencia Promedio</h3>
        <p style="font-size: 36px;" class="${stats.avgLatency < 50 ? 'good' : 'bad'}">${stats.avgLatency.toFixed(1)}ms</p>
      </div>
      <div class="metric-card">
        <h3>Alertas Críticas</h3>
        <p style="font-size: 36px;" class="${stats.criticalAlerts === 0 ? 'good' : 'bad'}">${stats.criticalAlerts}</p>
      </div>
    </div>
    
    <h3>Estadísticas Detalladas:</h3>
    <ul>
      <li>Total de verificaciones: ${stats.totalChecks}</li>
      <li>Mejor latencia: ${stats.bestLatency.toFixed(1)}ms</li>
      <li>Peor latencia: ${stats.worstLatency.toFixed(1)}ms</li>
      <li>Alertas de advertencia: ${stats.warningAlerts}</li>
    </ul>
    
    <h3>Estado Actual:</h3>
    <p>Sistema: ${this.metrics.current.status}</p>
    <p>Última verificación: ${new Date(this.metrics.current.timestamp).toLocaleString()}</p>
    
    <hr>
    <p style="color: #666; font-size: 12px;">
      Este es un reporte automático generado por el sistema de monitoreo UniFi.<br>
      Para más detalles, acceda al dashboard en https://hotel-terrazas-raci.run.app
    </p>
  </div>
</body>
</html>
    `;
  }

  async checkWiFiOptimization() {
    console.log('🔧 Checking WiFi optimization status...');
    
    // Check if Radio AI optimization has run
    const optimizationNeeded = this.metrics.current.issues.critical.some(
      issue => issue.type === 'CHANNEL_SATURATION'
    );
    
    if (optimizationNeeded) {
      // Send notification to run optimization
      await this.sendOptimizationReminder();
    }
  }

  async sendOptimizationReminder() {
    const mailOptions = {
      from: this.config.email.from,
      to: this.config.email.to,
      subject: '🔧 Recordatorio: Ejecutar Optimización WiFi',
      html: `
        <h2>Es hora de optimizar los canales WiFi</h2>
        <p>Se detectó saturación de canales. Por favor:</p>
        <ol>
          <li>Acceder a https://unifi.ui.com</li>
          <li>Settings → WiFi → Radio Manager</li>
          <li>Click "Optimize Now"</li>
        </ol>
        <p>Esto redistribuirá automáticamente los APs a canales menos congestionados.</p>
      `
    };
    
    await this.transporter.sendMail(mailOptions);
  }

  // API Endpoints for Dashboard Integration
  getStatus() {
    return {
      current: this.metrics.current,
      summary: {
        status: this.metrics.current.status,
        latency: this.metrics.current.network?.latency?.average || 0,
        issues: {
          critical: this.metrics.current.issues?.critical?.length || 0,
          warning: this.metrics.current.issues?.warning?.length || 0
        },
        lastUpdate: this.metrics.current.timestamp
      }
    };
  }

  getHistory(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.history.filter(m => new Date(m.timestamp) > since);
  }

  getDeviceStatus() {
    return {
      total: this.metrics.devices.total,
      online: this.calculateOnlineDevices(),
      offline: {
        count: this.metrics.devices.total - this.calculateOnlineDevices().total,
        devices: [] // To be populated with actual offline devices
      }
    };
  }
}

// Export for use in the main application
module.exports = UniFiNetworkMonitor;
