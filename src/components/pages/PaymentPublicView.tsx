'use client';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PaymentPublicView = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<any>(null);
  
  useEffect(() => {
    const fetchPayment = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get API URL from environment or use default
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        console.log('Using API URL:', apiUrl);
        
        console.log('Fetching payment with ID:', id);
        const response = await axios.get(`${apiUrl}/payments/public/${id}`);
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          setPayment(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch payment');
        }
      } catch (err: any) {
        console.error('Error fetching payment:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayment();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !payment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center p-8 rounded-xl border border-gray-700 bg-gray-800">
          <h2 className="text-xl font-semibold text-white mb-2">Payment not found</h2>
          <p className="text-gray-300 mb-4">{error || 'The payment could not be loaded'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-4">Payment Details (Public View)</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-2">Payment Details</h2>
              <p className="text-gray-300">ID: {payment._id}</p>
              <p className="text-gray-300">Amount: ${payment.amount}</p>
              <p className="text-gray-300">Status: {payment.status}</p>
              <p className="text-gray-300">Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
              <p className="text-gray-300">Method: {payment.paymentMethod || 'Not specified'}</p>
            </div>
            
            {payment.tenantId && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-2">Tenant</h2>
                <p className="text-gray-300">Name: {payment.tenantId.name}</p>
                <p className="text-gray-300">Email: {payment.tenantId.email}</p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Raw Data</h2>
            <pre className="text-gray-300 text-sm overflow-auto max-h-96 p-2 bg-gray-900 rounded">
              {JSON.stringify(payment, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPublicView;