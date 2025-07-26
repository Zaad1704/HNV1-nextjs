'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GoogleDebugPage: React.FC = () => {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const allParams = Object.fromEntries(urlParams.entries());
    
    const info = {
      currentUrl: window.location.href,
      pathname: window.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin,
      allParams,
      paramCount: Object.keys(allParams).length,
      hasToken: !!urlParams.get('token'),
      hasCode: !!urlParams.get('code'),
      hasError: !!urlParams.get('error'),
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
    console.log('Google Debug Info:', info);
  }, []);

  return (
    <div className="min-h-screen bg-app-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Google Authentication Debug</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Debug
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDebugPage;