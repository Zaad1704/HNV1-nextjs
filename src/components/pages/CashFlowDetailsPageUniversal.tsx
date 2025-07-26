'use client';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  DollarSign, 
  Calendar, 
  Building2, 
  Tag, 
  FileText, 
  Edit, 
  ArrowLeft,
  Download,
  Share2,
  Save,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchCashFlowDetails = async (id: string) => {
  const { data } = await apiClient.get(`/cashflow/${id}`);
  return data.data;
};

const CashFlowDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { currency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: cashFlow, isLoading, error } = useQuery({
    queryKey: ['cashflow', id],
    queryFn: () => fetchCashFlowDetails(id!),
    enabled: Boolean(id)
  });

  const handleBack = () => {
    router.push('/dashboard/cashflow-universal');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading cash flow details...</span>
      </div>
    );
  }

  if (error || !cashFlow) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-white mb-2">Cash Flow Record Not Found</h3>
        <p className="text-white/70 mb-4">The cash flow record you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Cash Flow
        </button>
      </div>
    );
  }

  const isIncome = cashFlow.type === 'income';

  return (
    <>
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
        <div className="relative rounded-3xl p-6 border-2 border-white/40" style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', 
          backdropFilter: 'blur(25px) saturate(200%)',
          WebkitBackdropFilter: 'blur(25px) saturate(200%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                  {isIncome ? 'Income' : 'Expense'} Details - {currency}{(cashFlow?.amount || 0).toLocaleString()}
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  {isIncome ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{cashFlow?.description || 'Cash Flow Transaction'} - {new Date(cashFlow?.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
                <button
                  onClick={() => {
                    setEditData({
                      amount: cashFlow?.amount || 0,
                      description: cashFlow?.description || '',
                      category: cashFlow?.category || '',
                      type: cashFlow?.type || 'income',
                      date: cashFlow?.date ? new Date(cashFlow.date).toISOString().split('T')[0] : ''
                    });
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                  title="Edit Transaction"
                >
                  <Edit size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={() => {
                  const shareData = {
                    title: `${isIncome ? 'Income' : 'Expense'} - ${currency}${cashFlow?.amount}`,
                    text: `${cashFlow?.description || 'Cash Flow Transaction'}`,
                    url: window.location.href
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Share Transaction"
              >
                <Share2 size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {/* Transaction Overview */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold mb-4 text-white/90">Transaction Overview</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: isIncome ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                  {isIncome ? <TrendingUp size={32} className="text-green-300" /> : <TrendingDown size={32} className="text-red-300" />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currency}{(cashFlow?.amount || 0).toLocaleString()}</h2>
                  <p className={`font-medium ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                    {isIncome ? 'Income' : 'Expense'} Transaction
                  </p>
                </div>
              </div>
              <UniversalStatusBadge 
                status={isIncome ? 'Income' : 'Expense'} 
                variant={isIncome ? 'success' : 'error'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Date</p>
                    <p className="font-semibold text-white">{new Date(cashFlow?.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Tag size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Category</p>
                    <p className="font-semibold text-white">{cashFlow?.category || 'Uncategorized'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Building2 size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Property</p>
                    <p className="font-semibold text-white">{cashFlow?.propertyName || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Description</p>
                    <p className="font-semibold text-white">{cashFlow?.description || 'No description'}</p>
                  </div>
                </div>
              </div>
            </div>
          </UniversalGlassyCardSimple>

          {/* Transaction Details */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
              <FileText size={20} className="text-yellow-300" />
              Transaction Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Transaction ID</p>
                    <p className="font-semibold text-white font-mono">{cashFlow?._id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Created At</p>
                    <p className="font-semibold text-white">{cashFlow?.createdAt ? new Date(cashFlow.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <DollarSign size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Type</p>
                    <p className="font-semibold text-white">{isIncome ? 'Income' : 'Expense'}</p>
                  </div>
                </div>
                {cashFlow?.notes && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <FileText size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Notes</p>
                      <p className="font-semibold text-white">{cashFlow.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </UniversalGlassyCardSimple>
        </div>
      </div>
      
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Transaction</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editData.category}
                  onChange={(e) => setEditData({...editData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({...editData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({...editData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiClient.put(`/cashflow/${id}`, editData);
                    queryClient.invalidateQueries({ queryKey: ['cashflow', id] });
                    setIsEditing(false);
                    alert('Transaction updated successfully!');
                  } catch (error) {
                    console.error('Error updating transaction:', error);
                    alert('Failed to update transaction. Please try again.');
                  }
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CashFlowDetailsPageUniversal;