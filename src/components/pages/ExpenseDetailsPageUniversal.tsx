'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Receipt, 
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
  DollarSign,
  User
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchExpenseDetails = async (id: string) => {
  const { data } = await apiClient.get(`/expenses/${id}`);
  return data.data;
};

const ExpenseDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { currency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: expense, isLoading, error } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => fetchExpenseDetails(id!),
    enabled: Boolean(id)
  });

  const handleBack = () => {
    router.push('/dashboard/expenses-universal');
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await apiClient.get(`/expenses/${id}/receipt`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-receipt-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download receipt');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading expense details...</span>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-white mb-2">Expense Not Found</h3>
        <p className="text-white/70 mb-4">The expense record you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Expenses
        </button>
      </div>
    );
  }

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
                  Expense Details - {currency}{(expense?.amount || 0).toLocaleString()}
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <Receipt size={16} />
                  <span>{expense?.description || 'Expense'} - {new Date(expense?.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
                <button
                  onClick={() => {
                    setEditData({
                      amount: expense?.amount || 0,
                      description: expense?.description || '',
                      category: expense?.category || '',
                      date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : '',
                      vendor: expense?.vendor || '',
                      notes: expense?.notes || ''
                    });
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                  title="Edit Expense"
                >
                  <Edit size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={handleDownloadReceipt}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Download Receipt"
              >
                <Download size={20} className="text-white" />
              </button>
              <button
                onClick={() => {
                  const shareData = {
                    title: `Expense - ${currency}${expense?.amount}`,
                    text: `${expense?.description || 'Expense Record'}`,
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
                title="Share Expense"
              >
                <Share2 size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {/* Expense Overview */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold mb-4 text-white/90">Expense Overview</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Receipt size={32} className="text-red-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currency}{(expense?.amount || 0).toLocaleString()}</h2>
                  <p className="text-red-400 font-medium">Expense Record</p>
                </div>
              </div>
              <UniversalStatusBadge 
                status={expense?.status || 'Recorded'} 
                variant="warning"
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
                    <p className="font-semibold text-white">{new Date(expense?.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Tag size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Category</p>
                    <p className="font-semibold text-white">{expense?.category || 'Miscellaneous'}</p>
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
                    <p className="font-semibold text-white">{expense?.propertyId?.name || 'General'}</p>
                  </div>
                </div>
                {expense?.vendor && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <User size={20} className="text-orange-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Vendor</p>
                      <p className="font-semibold text-white">{expense.vendor}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {expense?.description && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Description</p>
                    <p className="font-semibold text-white">{expense.description}</p>
                  </div>
                </div>
              </div>
            )}
          </UniversalGlassyCardSimple>

          {/* Property Information */}
          {expense?.propertyId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-purple-300" />
                Property Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Building2 size={32} className="text-purple-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{expense?.propertyId?.name || 'Unknown Property'}</h4>
                  {expense?.propertyId?.address && (
                    <p className="text-purple-400">{expense.propertyId.address.formattedAddress || expense.propertyId.address.street || 'No address'}</p>
                  )}
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

          {/* Expense Details */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
              <FileText size={20} className="text-yellow-300" />
              Expense Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Receipt size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Expense ID</p>
                    <p className="font-semibold text-white font-mono">{expense?._id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Created At</p>
                    <p className="font-semibold text-white">{expense?.createdAt ? new Date(expense.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <User size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Recorded By</p>
                    <p className="font-semibold text-white">{expense?.recordedBy?.name || 'System'}</p>
                  </div>
                </div>
                {expense?.notes && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <FileText size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Notes</p>
                      <p className="font-semibold text-white">{expense.notes}</p>
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
              <h3 className="text-lg font-bold text-gray-900">Edit Expense</h3>
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
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({...editData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Taxes">Taxes</option>
                  <option value="Legal">Legal</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  value={editData.vendor}
                  onChange={(e) => setEditData({...editData, vendor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiClient.put(`/expenses/${id}`, editData);
                    queryClient.invalidateQueries({ queryKey: ['expense', id] });
                    setIsEditing(false);
                    alert('Expense updated successfully!');
                  } catch (error) {
                    console.error('Error updating expense:', error);
                    alert('Failed to update expense. Please try again.');
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

export default ExpenseDetailsPageUniversal;