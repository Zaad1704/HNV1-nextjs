import React from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

const DashboardDebug: React.FC = () => {
  const { user, token } = useAuthStore();
  const [debugInfo, setDebugInfo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        isEmailVerified: user.isEmailVerified
      } : null,
      hasToken: !!token,
      apiBaseUrl: apiClient.defaults.baseURL,
      tests: {}
    };

    // Test API connectivity
    try {
      const healthResponse = await apiClient.get('/health');
      info.tests.health = { success: true, data: healthResponse.data };
    } catch (error: any) {
      info.tests.health = { success: false, error: error.message, status: error.response?.status };
    }

    // Test auth endpoint
    try {
      const authResponse = await apiClient.get('/auth/me');
      info.tests.auth = { success: true, data: authResponse.data };
    } catch (error: any) {
      info.tests.auth = { success: false, error: error.message, status: error.response?.status };
    }

    // Test dashboard stats
    try {
      const statsResponse = await apiClient.get('/dashboard/stats');
      info.tests.dashboardStats = { success: true, data: statsResponse.data };
    } catch (error: any) {
      info.tests.dashboardStats = { success: false, error: error.message, status: error.response?.status };
    }

    setDebugInfo(info);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard Debug Information</h1>
        
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
        >
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>

        {debugInfo && (
          <div className="bg-white p-4 rounded shadow">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDebug;