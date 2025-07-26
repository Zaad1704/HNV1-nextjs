'use client';
import React from 'react';
import { useParams } from 'next/navigation';

const PaymentDebugInfo = () => {
  const params = useParams();
  
  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff' }}>
      <h1>URL Parameters Debug</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <h2>Current URL</h2>
      <p>{window.location.href}</p>
      <h2>Path</h2>
      <p>{window.pathname}</p>
    </div>
  );
};

export default PaymentDebugInfo;