import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import apiClient from '@/lib/api';

interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  message: string;
  timestamp: string;
  queryTime?: string;
}

const DashboardMonitor: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      const { data } = await apiClient.get('/health/dashboard');
      if (data.success) {
        setHealth({
          status: 'ok',
          message: 'Dashboard is healthy',
          timestamp: new Date().toISOString(),
          queryTime: data.data.queryTime
        });
      } else {
        setHealth({
          status: 'warning',
          message: data.message || 'Dashboard health check returned warning',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      setHealth({
        status: 'error',
        message: error.userMessage || error.message || 'Dashboard health check failed',
        timestamp: new Date().toISOString()
      });
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    // Check health on mount
    checkHealth();

    // Set up periodic health checks (every 2 minutes)
    const interval = setInterval(checkHealth, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Show monitor if there are issues or in development
  useEffect(() => {
    const shouldShow = health?.status !== 'ok' || import.meta.env.DEV;
    setIsVisible(shouldShow);
  }, [health]);

  if (!isVisible || !health) return null;

  const getStatusIcon = () => {
    switch (health.status) {
      case 'ok':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error':
        return <WifiOff size={16} className="text-red-500" />;
      default:
        return <Wifi size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'ok':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm p-3 rounded-lg border ${getStatusColor()} shadow-lg`}>
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <span className="font-medium text-sm">Dashboard Status</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto text-xs opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <div>{health.message}</div>
        {health.queryTime && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Query time: {health.queryTime}</span>
          </div>
        )}
        {lastCheck && (
          <div className="text-xs opacity-60">
            Last check: {lastCheck.toLocaleTimeString()}
          </div>
        )}
      </div>

      {health.status !== 'ok' && (
        <button
          onClick={checkHealth}
          className="mt-2 px-2 py-1 bg-white/50 rounded text-xs hover:bg-white/70 transition-colors"
        >
          Recheck
        </button>
      )}
    </div>
  );
};

export default DashboardMonitor;