import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({
    status: 'LOADING',
    latency: 0,
    issues: { critical: 0, warning: 0 }
  });

  useEffect(() => {
    const fetchNetworkStatus = async () => {
      try {
        const response = await fetch('/api/network/status');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(data.summary);
      } catch (e) {
        console.error('Error fetching network status:', e);
        setError('Failed to load network status');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkStatus();
    const interval = setInterval(fetchNetworkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'CRITICAL': return 'bg-red-600';
      case 'WARNING': return 'bg-yellow-500';
      case 'HEALTHY': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getLatencyColor = () => {
    if (status.latency > 50) return 'text-red-500';
    if (status.latency > 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <h3 className="text-lg font-semibold mb-4">Network Status</h3>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Network Status</h3>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Hotel Network Status</h3>
      
      <div className={`${getStatusColor()} text-white p-4 rounded mb-4`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xl font-bold">{status.status}</div>
            <div className="text-sm opacity-90">
              Latency: <span className={getLatencyColor()}>{status.latency}ms</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              {status.issues.critical} Critical
            </div>
            <div className="text-sm">
              {status.issues.warning} Warnings
            </div>
          </div>
        </div>
      </div>

      {status.status === 'CRITICAL' && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <div>
              <p className="font-medium">Critical network issues detected!</p>
              <p className="text-sm text-gray-600">
                Immediate attention required for optimal hotel operations.
              </p>
            </div>
          </div>
        </div>
      )}

      {status.status === 'WARNING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <div className="flex items-center">
            <div className="text-yellow-500 mr-2">⚠️</div>
            <div>
              <p className="font-medium">Network warnings detected</p>
              <p className="text-sm text-gray-600">
                Minor issues that should be monitored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
