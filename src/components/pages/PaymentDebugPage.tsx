'use client';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '@/lib/api';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';

const PaymentDebugPage = () => {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        // Try the debug endpoint first
        const response = await apiClient.get(`/payments/debug/${id}`);
        setPayment(response.data.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Debug endpoint failed:', err);
        try {
          // Fall back to regular endpoint
          const response = await apiClient.get(`/payments/${id}`);
          setPayment(response.data.data);
          setLoading(false);
        } catch (err2: any) {
          console.error('Both endpoints failed:', err2);
          setError(err2.message || 'Failed to load payment details');
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchPayment();
    }
  }, [id]);

  if (loading) {
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-spin">
              <div className="w-full h-full rounded-full border-2 border-transparent border-t-white"></div>
            </div>
            <p className="text-white font-medium">Loading payment details (debug mode)...</p>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  if (error || !payment) {
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 rounded-3xl border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <h2 className="text-xl font-semibold text-white mb-2">Payment not found</h2>
            <p className="text-white/80 mb-4">Error: {error || 'Unknown error'}</p>
            <Link to="/dashboard/payments" className="bg-gradient-to-r from-orange-400 to-blue-400 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all">
              ← Back to Payments
            </Link>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  return (
    <PropertyStyleBackground>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-4">Payment Debug View</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-2">Payment Details</h2>
              <p className="text-white/80">ID: {payment._id}</p>
              <p className="text-white/80">Amount: ${payment.amount}</p>
              <p className="text-white/80">Status: {payment.status}</p>
              <p className="text-white/80">Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
              <p className="text-white/80">Method: {payment.paymentMethod || 'Not specified'}</p>
            </div>
            
            {payment.tenantId && (
              <div className="bg-white/5 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-2">Tenant</h2>
                <p className="text-white/80">Name: {payment.tenantId.name}</p>
                <p className="text-white/80">Email: {payment.tenantId.email}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Raw Data</h2>
            <pre className="text-white/70 text-sm overflow-auto max-h-96 p-2 bg-black/20 rounded">
              {JSON.stringify(payment, null, 2)}
            </pre>
          </div>
          
          <div className="flex gap-4">
            <Link to="/dashboard/payments" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all">
              Back to Payments
            </Link>
            <Link to={`/dashboard/payments/details/${id}`} className="bg-blue-500/50 hover:bg-blue-500/70 text-white px-4 py-2 rounded-lg transition-all">
              Go to Regular View
            </Link>
          </div>
        </div>
      </div>
    </PropertyStyleBackground>
  );
};

export default PaymentDebugPage;