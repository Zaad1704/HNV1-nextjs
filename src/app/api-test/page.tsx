'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, method: string = 'GET', data?: any) => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, options);
      const result = await response.json();
      setResult(result);
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🚀 Backend API Test Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">✅ Backend Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => testEndpoint('/health')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              disabled={loading}
            >
              🏥 Health Check
            </button>
            <button
              onClick={() => testEndpoint('/api-docs')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              📚 API Documentation
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔐 Authentication Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => testEndpoint('/api/auth/register', 'POST', {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@test.com',
                password: 'password123',
                organizationName: 'Test Property Management'
              })}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              disabled={loading}
            >
              👤 Test Registration
            </button>
            <button
              onClick={() => testEndpoint('/api/auth/login', 'POST', {
                email: 'john@test.com',
                password: 'password123'
              })}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
              disabled={loading}
            >
              🔑 Test Login
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🏢 API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => testEndpoint('/api/properties')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              disabled={loading}
            >
              🏠 Properties
            </button>
            <button
              onClick={() => testEndpoint('/api/tenants')}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              disabled={loading}
            >
              👥 Tenants
            </button>
            <button
              onClick={() => testEndpoint('/api/dashboard/stats')}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 disabled:opacity-50"
              disabled={loading}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => testEndpoint('/api/payments')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              disabled={loading}
            >
              💰 Payments
            </button>
            <button
              onClick={() => testEndpoint('/api/expenses')}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
              disabled={loading}
            >
              📋 Expenses
            </button>
            <button
              onClick={() => testEndpoint('/api/maintenance')}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50"
              disabled={loading}
            >
              🔧 Maintenance
            </button>
            <button
              onClick={() => testEndpoint('/api/analytics/advanced')}
              className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 disabled:opacity-50"
              disabled={loading}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => testEndpoint('/api/notifications/test', 'POST')}
              className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600 disabled:opacity-50"
              disabled={loading}
            >
              🔔 Notifications
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-800">Testing API endpoint...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 API Response</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 Backend Status:</h3>
          <p className="text-yellow-700">Backend server running on: <code className="bg-yellow-100 px-2 py-1 rounded">http://localhost:5000</code></p>
          <p className="text-yellow-700 mt-1">API endpoints available at: <code className="bg-yellow-100 px-2 py-1 rounded">http://localhost:5000/api/*</code></p>
        </div>
      </div>
    </div>
  );
}