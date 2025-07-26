import React, { useState } from 'react';
import { X, Bell, User, Clock, Calendar } from 'lucide-react';
import apiClient from '@/lib/api';

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReminderCreated: () => void;
}

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  onReminderCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    frequency: 'monthly',
    scope: 'all',
    tenantId: '',
    deliveryMethod: 'email',
    triggerConditions: ['payment_overdue'],
    escalationRules: ['3_days', '7_days'],
    autoApprovalThreshold: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiClient.post('/reminders', {
        ...formData,
        automationRules: {
          triggerConditions: formData.triggerConditions,
          escalationRules: formData.escalationRules,
          stopConditions: ['payment_received']
        }
      });
      onReminderCreated();
      onClose();
    } catch (error) {
      alert('Failed to create reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Create Reminder</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Reminder Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="Monthly Rent Reminder"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              rows={3}
              placeholder="Your rent payment is due..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Delivery Method
              </label>
              <select
                value={formData.deliveryMethod}
                onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value})}
                className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Email & SMS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Target Scope
            </label>
            <select
              value={formData.scope}
              onChange={(e) => setFormData({...formData, scope: e.target.value})}
              className="w-full p-3 border border-app-border rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            >
              <option value="all">All Tenants</option>
              <option value="property">Specific Property</option>
              <option value="tenant">Specific Tenant</option>
            </select>
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
              {isSubmitting ? 'Creating...' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReminderModal;