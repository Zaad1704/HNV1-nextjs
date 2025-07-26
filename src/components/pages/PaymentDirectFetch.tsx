'use client';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';

const PaymentDirectFetch = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [requestTime, setRequestTime] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const fetchPayment = async () => {
    setLoading(true);
    setError(null);
    setPayment(null);
    const startTime = Date.now();
    setRequestTime(startTime);
    
    try {
      const response = await apiClient.get(`/payments/${id}`);
      const endTime = Date.now();
      setResponseTime(endTime);
      
      console.log('API Response:', response);
      setPayment(response.data.data);
    } catch (err) {
      const endTime = Date.now();
      setResponseTime(endTime);
      console.error('Error fetching payment:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  return (
    <PropertyStyleBackground>
      <div className="p-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={`/dashboard/payments/${id}`}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={20} className="text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Payment API Test</h1>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">API Request Details</h2>
              <button 
                onClick={fetchPayment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/50 hover:bg-blue-500/70 text-white rounded-lg transition-all"
              >
                <RefreshCw size={16} />
                Retry Request
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/70 text-sm mb-1">Endpoint</p>
                <p className="font-mono text-white bg-black/30 p-2 rounded">/api/payments/{id}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Method</p>
                <p className="font-mono text-white bg-black/30 p-2 rounded">GET</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Request Time</p>
                <p className="font-mono text-white bg-black/30 p-2 rounded">
                  {requestTime ? new Date(requestTime).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Response Time</p>
                <p className="font-mono text-white bg-black/30 p-2 rounded">
                  {responseTime ? new Date(responseTime).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Duration</p>
                <p className="font-mono text-white bg-black/30 p-2 rounded">
                  {requestTime && responseTime ? `${responseTime - requestTime}ms` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">Status</p>
                <p className={`font-mono p-2 rounded ${loading ? 'text-yellow-400 bg-yellow-900/30' : error ? 'text-red-400 bg-red-900/30' : 'text-green-400 bg-green-900/30'}`}>
                  {loading ? 'Loading...' : error ? 'Error' : 'Success'}
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-white">Fetching payment data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-black/30 backdrop-blur-md border border-red-500/30 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Error Response</h2>
              <div className="bg-red-900/20 p-4 rounded-lg mb-4">
                <p className="text-white/90 mb-2">
                  <span className="font-semibold">Message:</span> {error.message}
                </p>
                {error.response && (
                  <>
                    <p className="text-white/90 mb-2">
                      <span className="font-semibold">Status:</span> {error.response.status}
                    </p>
                    <p className="text-white/90">
                      <span className="font-semibold">Status Text:</span> {error.response.statusText}
                    </p>
                  </>
                )}
              </div>
              
              {error.response && error.response.data && (
                <div className="mb-4">
                  <p className="text-white/70 text-sm mb-2">Response Data:</p>
                  <pre className="bg-black/50 p-4 rounded-lg text-white/90 overflow-auto max-h-60 text-sm">
                    {JSON.stringify(error.response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {payment && (
            <div className="bg-black/30 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-400 mb-4">Success Response</h2>
              <div className="mb-4">
                <p className="text-white/70 text-sm mb-2">Payment Data:</p>
                <pre className="bg-black/50 p-4 rounded-lg text-white/90 overflow-auto max-h-96 text-sm">
                  {JSON.stringify(payment, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </PropertyStyleBackground>
  );
};

export default PaymentDirectFetch;