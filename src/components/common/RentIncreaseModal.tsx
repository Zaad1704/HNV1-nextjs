import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import apiClient from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface RentIncreaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
  tenant?: any;
  type: 'property' | 'tenant';
}

const RentIncreaseModal: React.FC<RentIncreaseModalProps> = ({ 
  isOpen, 
  onClose, 
  property, 
  tenant, 
  type 
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    increaseType: 'percentage',
    amount: '',
    percentage: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: '',
    notifyTenants: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        amount: formData.increaseType === 'fixed' ? Number(formData.amount) : 0,
        percentage: formData.increaseType === 'percentage' ? Number(formData.percentage) : 0,
        propertyId: property?._id,
        tenantId: tenant?._id,
        type
      };

      await apiClient.post('/rent-increase', payload);
      
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      alert(`Rent increase applied successfully for ${type}!`);
      onClose();
      
      setFormData({
        increaseType: 'percentage',
        amount: '',
        percentage: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: '',
        notifyTenants: true
      });
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to apply rent increase'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Rent Increase</h3>
              <p className="text-sm text-gray-600">
                {type === 'property' ? property?.name : tenant?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Increase Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, increaseType: 'percentage' })}
                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${
                  formData.increaseType === 'percentage'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Percent size={20} />
                <span className="font-medium">Percentage</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, increaseType: 'fixed' })}
                className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${
                  formData.increaseType === 'fixed'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign size={20} />
                <span className="font-medium">Fixed Amount</span>
              </button>
            </div>
          </div>

          {formData.increaseType === 'percentage' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage Increase (%)
              </label>
              <div className="relative">
                <Percent size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="5.0"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Amount Increase ($)
              </label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="100.00"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective Date
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Increase
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Market adjustment, property improvements, etc."
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifyTenants"
              checked={formData.notifyTenants}
              onChange={(e) => setFormData({ ...formData, notifyTenants: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="notifyTenants" className="text-sm text-gray-700">
              Notify tenants automatically
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Applying...' : 'Apply Increase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentIncreaseModal;