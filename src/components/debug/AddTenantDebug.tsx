import React, { useState } from 'react';

const AddTenantDebug = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testButtonClick = () => {
    try {
      addLog('✅ Button clicked successfully');
      
      // Test modal state
      const [showModal, setShowModal] = useState(false);
      setShowModal(true);
      addLog('✅ Modal state changed');
      
      // Test form data
      const formData = {
        name: 'Test Tenant',
        email: 'test@example.com',
        phone: '1234567890'
      };
      addLog(`✅ Form data created: ${JSON.stringify(formData)}`);
      
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">Add Tenant Debug</h3>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={testButtonClick}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Button
        </button>
        <button 
          onClick={clearLogs}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm ml-2"
        >
          Clear
        </button>
      </div>
      
      <div className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddTenantDebug;