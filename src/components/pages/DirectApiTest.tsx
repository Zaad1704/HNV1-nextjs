'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const DirectApiTest = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState('');
  
  // Get API URL from environment or use default
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    setApiUrl(url);
  }, []);
  
  // Function to test API directly
  const testApi = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(endpoint);
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', background: '#222', color: '#fff', fontFamily: 'monospace' }}>
      <h1>Direct API Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <p>API URL: {apiUrl}</p>
        <p>Payment ID: {id || 'Not provided'}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => testApi(`${apiUrl}/payments/${id}`)}
          style={{ padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Test Regular Endpoint
        </button>
        
        <button 
          onClick={() => testApi(`${apiUrl}/payments/debug/${id}`)}
          style={{ padding: '10px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Test Debug Endpoint
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ padding: '15px', background: '#e74c3c', color: '#fff', borderRadius: '4px', marginBottom: '20px' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {data && (
        <div style={{ marginTop: '20px' }}>
          <h3>API Response</h3>
          <div style={{ padding: '15px', background: '#34495e', color: '#fff', borderRadius: '4px', overflow: 'auto' }}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <Link href="/dashboard/payments" style={{ color: '#3498db' }}>Back to Payments</Link>
      </div>
    </div>
  );
};

export default DirectApiTest;