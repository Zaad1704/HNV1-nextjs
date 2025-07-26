import React, { useState } from 'react';
import { X, DollarSign, User, Calendar, Building2, CreditCard, Percent, FileText, Users } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: (payment: any) => void;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({ isOpen, onClose, onPaymentAdded }) => {
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    amount: '',
    originalAmount: '',
    discountType: 'none' as 'none' | 'percentage' | 'fixed',
    discountValue: '',
    description: 'Manual Payment Collection',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    collectionMethod: 'tenant_direct',
    notes: '',
    receivedBy: 'landlord',
    agentName: '',
    handoverDate: new Date().toISOString().split('T')[0],
    referenceNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', formData.propertyId],
    queryFn: async () => {
      if (!formData.propertyId) return [];
      const { data } = await apiClient.get(`/tenants?propertyId=${formData.propertyId}`);
      return data.data || [];
    },
    enabled: !!formData.propertyId
  });
  
  const selectedTenant = tenants.find((t: any) => t._id === formData.tenantId);
  const baseAmount = selectedTenant?.rentAmount || parseFloat(formData.originalAmount) || 0;
  
  const calculateFinalAmount = () => {
    if (formData.discountType === 'none') return baseAmount;
    const discount = parseFloat(formData.discountValue) || 0;
    if (formData.discountType === 'percentage') {
      return baseAmount - (baseAmount * discount / 100);
    } else {
      return Math.max(0, baseAmount - discount);
    }
  };
  
  const finalAmount = calculateFinalAmount();

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.propertyId) errors.propertyId = 'Please select a property';
    if (!formData.tenantId) errors.tenantId = 'Please select a tenant';
    if (!formData.paymentDate) errors.paymentDate = 'Payment date is required';
    if (finalAmount <= 0) errors.amount = 'Payment amount must be greater than 0';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true);
    setValidationErrors({});
    
    try {
      const paymentData = {
        tenantId: formData.tenantId,
        propertyId: formData.propertyId,
        amount: finalAmount,
        originalAmount: baseAmount,
        discount: formData.discountType !== 'none' ? {
          type: formData.discountType,
          value: parseFloat(formData.discountValue) || 0,
          amount: baseAmount - finalAmount
        } : null,
        description: formData.description,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        collectionMethod: formData.collectionMethod,
        notes: formData.notes,
        receivedBy: formData.receivedBy,
        agentName: formData.agentName,
        handoverDate: formData.handoverDate,
        referenceNumber: formData.referenceNumber,
        recordedBy: user?._id,
        status: 'Paid'
      };
      
      const response = await apiClient.post('/payments', paymentData);
      onPaymentAdded(response.data.data);
      
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
      
      // Reset form
      setFormData({
        propertyId: '',
        tenantId: '',
        amount: '',
        originalAmount: '',
        discountType: 'none',
        discountValue: '',
        description: 'Manual Payment Collection',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        collectionMethod: 'tenant_direct',
        notes: '',
        receivedBy: 'landlord',
        agentName: '',
        handoverDate: new Date().toISOString().split('T')[0],
        referenceNumber: ''
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-dark-orange-blue rounded-2xl flex items-center justify-center">
              <DollarSign size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Payment Collection & Handover</h3>
              <p className="text-gray-600">Record payments collected by agents, cash handovers, deposits, and transfers</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property & Tenant Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Property *
              </label>
              <div className="relative">
                <Building2 size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={formData.propertyId}
                  onChange={(e) => {
                    setFormData({ ...formData, propertyId: e.target.value, tenantId: '' });
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                >
                  <option value="">Choose a property...</option>
                  {properties.map((property: any) => (
                    <option key={property._id} value={property._id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tenant *
              </label>
              <div className="relative">
                <Users size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                  disabled={!formData.propertyId}
                >
                  <option value="">Choose a tenant...</option>
                  {tenants.map((tenant: any) => (
                    <option key={tenant._id} value={tenant._id}>
                      {tenant.name} - Unit {tenant.unit} (${tenant.rentAmount})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amount & Discount */}
          {selectedTenant && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">Payment Amount</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="none"
                    checked={formData.discountType === 'none'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="mr-2"
                  />
                  No Discount
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={formData.discountType === 'percentage'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="mr-2"
                  />
                  Percentage Discount
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    value="fixed"
                    checked={formData.discountType === 'fixed'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="mr-2"
                  />
                  Fixed Amount Discount
                </label>
              </div>
              
              {formData.discountType !== 'none' && (
                <div className="mb-4">
                  <div className="relative">
                    {formData.discountType === 'percentage' ? (
                      <Percent size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    ) : (
                      <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    )}
                    <input
                      type="number"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                      placeholder={formData.discountType === 'percentage' ? '10' : '50.00'}
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span>Original Amount:</span>
                  <span>{currency}{baseAmount}</span>
                </div>
                {formData.discountType !== 'none' && (
                  <div className="flex justify-between text-sm text-green-600 mb-2">
                    <span>Discount:</span>
                    <span>-{currency}{(baseAmount - finalAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Final Amount:</span>
                  <span>{currency}{finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <div className="relative">
                  <CreditCard size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Check">Check</option>
                    <option value="Mobile Payment">Mobile Payment</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Method
                </label>
                <select
                  value={formData.collectionMethod}
                  onChange={(e) => setFormData({ ...formData, collectionMethod: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="tenant_direct">Tenant Direct Payment</option>
                  <option value="agent_collection">Agent Collected from Tenant</option>
                  <option value="agent_handover_cash">Agent Cash Handover to Landlord</option>
                  <option value="agent_bank_deposit">Agent Bank Deposit</option>
                  <option value="agent_bank_transfer">Agent Bank Transfer</option>
                  <option value="office_pickup">Office Pickup</option>
                  <option value="landlord_collection">Landlord Direct Collection</option>
                  <option value="other">Other Method</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Received By
                </label>
                <select
                  value={formData.receivedBy}
                  onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="landlord">Landlord</option>
                  <option value="agent">Property Agent</option>
                  <option value="manager">Property Manager</option>
                  <option value="landlord_bank">Landlord Bank Account</option>
                  <option value="company_account">Company Account</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agent & Handover Details */}
          {(formData.collectionMethod.includes('agent') || formData.receivedBy === 'agent') && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">Agent & Handover Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={formData.agentName}
                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Agent or collector name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handover Date
                  </label>
                  <input
                    type="date"
                    value={formData.handoverDate}
                    onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    placeholder="Deposit slip, transfer ref, etc."
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Description & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Payment description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection & Handover Details
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                rows={3}
                placeholder="Details about collection process, agent handover, bank deposit reference, transfer details, etc..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.tenantId}
              className="px-8 py-3 btn-gradient text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-bold"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              {isSubmitting ? 'Recording Payment...' : 'Record Manual Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPaymentModal;