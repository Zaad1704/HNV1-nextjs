import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import apiClient from '@/lib/api';

interface AddCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCashFlowModal: React.FC<AddCashFlowModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    propertyId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const endpoint = formData.type === 'income' ? '/payments' : '/expenses';
      await apiClient.post(endpoint, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      onClose();
      window.location.reload(); // Refresh to update cash flow
    } catch (error) {
      alert('Failed to add cash flow record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Add Cash Flow Record</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="Description..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-app-border rounded-xl text-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 btn-gradient text-white rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCashFlowModal;