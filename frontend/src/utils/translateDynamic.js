// Utility per tradurre messaggi dinamici dall'API
export const translateDynamicContent = (text, t) => {
  if (!text || typeof text !== 'string') return text;
  
  const lowerText = text.toLowerCase();
  
  // Traduci stati dispositivi
  const deviceStates = {
    'online': t('dynamicMessages.deviceStates.online'),
    'offline': t('dynamicMessages.deviceStates.offline'), 
    'connected': t('dynamicMessages.deviceStates.connected'),
    'disconnected': t('dynamicMessages.deviceStates.disconnected'),
    'active': t('dynamicMessages.deviceStates.active'),
    'inactive': t('dynamicMessages.deviceStates.inactive'),
    'healthy': t('dynamicMessages.deviceStates.healthy'),
    'unhealthy': t('dynamicMessages.deviceStates.unhealthy')
  };
  
  // Traduci messaggi di rete comuni
  const networkPatterns = [
    { pattern: /bandwidth.+limited/i, key: 'dynamicMessages.networkMessages.bandwidth_limited' },
    { pattern: /device.+unreachable/i, key: 'dynamicMessages.networkMessages.device_unreachable' },
    { pattern: /connection.+timeout/i, key: 'dynamicMessages.networkMessages.connection_timeout' },
    { pattern: /smart.+queues.+active/i, key: 'dynamicMessages.networkMessages.smart_queues_active' },
    { pattern: /limiting.+bandwidth/i, key: 'dynamicMessages.networkMessages.limiting_bandwidth' },
    { pattern: /high.+interference/i, key: 'dynamicMessages.networkMessages.high_interference' },
    { pattern: /channel.+congestion/i, key: 'dynamicMessages.networkMessages.channel_congestion' }
  ];
  
  // Traduci errori comuni
  const errorPatterns = [
    { pattern: /authentication.+failed/i, key: 'dynamicMessages.commonErrors.authentication_failed' },
    { pattern: /network.+unreachable/i, key: 'dynamicMessages.commonErrors.network_unreachable' },
    { pattern: /dns.+resolution.+failed/i, key: 'dynamicMessages.commonErrors.dns_resolution_failed' },
    { pattern: /certificate.+expired/i, key: 'dynamicMessages.commonErrors.certificate_expired' }
  ];
  
  // Controlla stati dispositivi esatti
  if (deviceStates[lowerText]) {
    return deviceStates[lowerText];
  }
  
  // Controlla pattern di rete
  for (const { pattern, key } of networkPatterns) {
    if (pattern.test(text)) {
      return t(key);
    }
  }
  
  // Controlla pattern di errori
  for (const { pattern, key } of errorPatterns) {
    if (pattern.test(text)) {
      return t(key);
    }
  }
  
  // Se non trova match, ritorna il testo originale
  return text;
};

// Utility per tradurre array di messaggi
export const translateDynamicArray = (messages, t) => {
  if (!Array.isArray(messages)) return messages;
  return messages.map(message => ({
    ...message,
    text: translateDynamicContent(message.text, t),
    status: translateDynamicContent(message.status, t)
  }));
};

// Utility per tradurre oggetti status di rete
export const translateNetworkStatus = (networkData, t) => {
  if (!networkData) return networkData;
  
  return {
    ...networkData,
    status: translateDynamicContent(networkData.status, t),
    message: translateDynamicContent(networkData.message, t),
    devices: networkData.devices?.map(device => ({
      ...device,
      status: translateDynamicContent(device.status, t),
      message: translateDynamicContent(device.message, t)
    }))
  };
};
