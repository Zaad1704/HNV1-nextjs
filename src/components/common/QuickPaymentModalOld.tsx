import React, { useState, useMemo } from 'react';
import { X, DollarSign, Calendar, CreditCard, Building2, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: any;
  onPaymentAdded: () => void;
  isOverdue?: boolean;
  overdueAmount?: number;
  monthsOverdue?: number;
}

const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  tenant, 
  onPaymentAdded, 
  isOverdue = false, 
  overdueAmount = 0, 
  monthsOverdue = 0 
}) => {
  const [selectedProperty, setSelectedProperty] = useState(tenant?.propertyId?._id || '');
  const [selectedTenant, setSelectedTenant] = useState(tenant?._id || '');
  const [formData, setFormData] = useState({
    amount: isOverdue ? overdueAmount.toString() : (tenant?.rentAmount?.toString() || ''),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    rentMonth: new Date().toISOString().slice(0, 7),
    notes: isOverdue ? `Payment for ${monthsOverdue} overdue months` : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  // Fetch tenants based on selected property
  const { data: allTenants = [] } = useQuery({
    queryKey: ['tenants', selectedProperty],
    queryFn: async () => {
      const url = selectedProperty ? `/tenants?propertyId=${selectedProperty}` : '/tenants';
      const { data } = await apiClient.get(url);
      return data.data || [];
    },
    enabled: isOpen
  });

  // Fetch existing payments for the selected month
  const { data: existingPayments = [] } = useQuery({
    queryKey: ['payments', formData.rentMonth],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payments?month=${formData.rentMonth}`);
      return data.data || [];
    },
    enabled: isOpen && !!formData.rentMonth
  });

  // Filter tenants who haven't paid for selected month
  const tenants = useMemo(() => {
    if (!formData.rentMonth) return allTenants;
    
    const paidTenantIds = existingPayments
      .filter(payment => {
        const paymentMonth = payment.rentMonth || new Date(payment.paymentDate).toISOString().slice(0, 7);
        return paymentMonth === formData.rentMonth;
      })
      .map(payment => payment.tenantId);
    
    return allTenants.filter(tenant => !paidTenantIds.includes(tenant._id));
  }, [allTenants, existingPayments, formData.rentMonth]);

  const selectedTenantData = tenants.find((t: any) => t._id === selectedTenant) || tenant;
  const selectedPropertyData = properties.find((p: any) => p._id === selectedProperty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!selectedTenant || !selectedProperty) {
        alert('Please select both property and tenant');
        return;
      }

      const paymentData = {
        tenantId: selectedTenant,
        propertyId: selectedProperty,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        description: formData.notes || `Payment for ${formData.rentMonth}`,
        rentMonth: formData.rentMonth,
        notes: formData.notes,
        status: 'Completed',
        type: 'rent',
        category: 'payment',
        auditCategory: 'payment',
        auditDescription: `Payment of $${formData.amount} recorded for ${selectedTenantData?.name || 'tenant'}`
      };

      console.log('Sending payment data:', paymentData);
      const response = await apiClient.post('/payments', paymentData);
      console.log('Payment response:', response.data);
      alert('Payment recorded successfully!');
      if (onPaymentAdded && typeof onPaymentAdded === 'function') {
        onPaymentAdded();
      }
      onClose();
      
      // Reset form
      setFormData({
        amount: isOverdue ? overdueAmount.toString() : (tenant?.rentAmount?.toString() || ''),
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        rentMonth: new Date().toISOString().slice(0, 7),
        notes: isOverdue ? `Payment for ${monthsOverdue} overdue months` : ''
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown error occurred';
      alert(`Failed to record payment: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isOverdue ? 'bg-red-500' : 'bg-green-500'} rounded-xl flex items-center justify-center`}>
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{isOverdue ? 'Overdue Payment' : 'Quick Payment'}</h3>
              <p className="text-sm text-gray-600">
                {tenant?.name}
                {isOverdue && <span className="text-red-600 ml-2">({monthsOverdue} months overdue)</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {!tenant && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedProperty}
                    onChange={(e) => {
                      setSelectedProperty(e.target.value);
                      setSelectedTenant('');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map((property: any) => (
                      <option key={property._id} value={property._id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Tenants</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedTenant}
                    onChange={(e) => {
                      setSelectedTenant(e.target.value);
                      const tenant = tenants.find((t: any) => t._id === e.target.value);
                      if (tenant) {
                        setFormData({ ...formData, amount: tenant.rentAmount?.toString() || '' });
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    disabled={!selectedProperty}
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map((tenant: any) => (
                      <option key={tenant._id} value={tenant._id}>
                        {tenant.name} - Unit {tenant.unit} (${tenant.rentAmount})
                      </option>
                    ))}
                  </select>
                </div>
                {tenants.length === 0 && formData.rentMonth && selectedProperty && (
                  <p className="text-sm text-orange-600 mt-1">
                    All tenants paid for {new Date(formData.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Online">Online Payment</option>
              <option value="Mobile Banking">Mobile Banking</option>
            </select>
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 ${isOverdue ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg disabled:opacity-50 transition-colors`}
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickPaymentModal;