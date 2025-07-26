import React, { useState } from 'react';
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
  const [tenantSearch, setTenantSearch] = useState('');

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
    queryKey: ['payments', selectedProperty, formData.rentMonth],
    queryFn: async () => {
      try {
        if (!selectedProperty || !formData.rentMonth) return [];
        const { data } = await apiClient.get(`/payments/property/${selectedProperty}/month/${formData.rentMonth}`);
        return data.data || [];
      } catch (error) {
        // Fallback to general payments endpoint
        try {
          const { data } = await apiClient.get('/payments');
          return (data.data || []).filter((payment: any) => {
            const paymentMonth = payment.rentMonth || new Date(payment.paymentDate).toISOString().slice(0, 7);
            return paymentMonth === formData.rentMonth && payment.propertyId === selectedProperty;
          });
        } catch (fallbackError) {
          return [];
        }
      }
    },
    enabled: isOpen && !!selectedProperty && !!formData.rentMonth
  });

  // Get available months (current and future only)
  const getAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push({
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
    return months;
  };

  const selectedTenantData = allTenants.find((t: any) => t._id === selectedTenant) || tenant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!selectedTenant || !selectedProperty) {
        alert('Please select both property and tenant');
        return;
      }

      // Enhanced duplicate payment check
      const duplicatePayment = existingPayments.find((payment: any) => 
        (payment.tenantId === selectedTenant || payment.tenantId?._id === selectedTenant) && 
        payment.rentMonth === formData.rentMonth &&
        (payment.status === 'Paid' || payment.status === 'Completed' || payment.status === 'completed')
      );
      
      if (duplicatePayment) {
        const monthName = new Date(formData.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        alert(`This tenant has already paid $${duplicatePayment.amount} for ${monthName}. Please choose a different tenant or month.`);
        return;
      }
      
      // Validate amount
      const amount = Number(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid payment amount greater than 0.');
        return;
      }
      
      // Validate payment date
      const paymentDate = new Date(formData.paymentDate);
      if (isNaN(paymentDate.getTime())) {
        alert('Please enter a valid payment date.');
        return;
      }
      
      if (paymentDate > new Date()) {
        alert('Payment date cannot be in the future.');
        return;
      }

      const paymentData = {
        tenantId: selectedTenant,
        propertyId: selectedProperty,
        amount: amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        description: formData.notes || `Rent payment for ${new Date(formData.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        rentMonth: formData.rentMonth,
        notes: formData.notes,
        status: 'Completed',
        receivedBy: user?.name || 'System',
        metadata: {
          source: 'quick_payment_modal',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
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

              {selectedProperty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Search tenants by name, unit, or phone..."
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {allTenants && allTenants.length > 0 ? allTenants
                      .filter((tenant: any) => {
                        if (!tenantSearch) return true;
                        const search = tenantSearch.toLowerCase();
                        return tenant.name?.toLowerCase().includes(search) ||
                               tenant.unit?.toLowerCase().includes(search) ||
                               tenant.phone?.includes(search) ||
                               tenant.email?.toLowerCase().includes(search);
                      })
                      .map((tenant: any) => {
                      const alreadyPaid = existingPayments.some((payment: any) => 
                        (payment.tenantId === tenant._id || payment.tenantId?._id === tenant._id) && 
                        payment.rentMonth === formData.rentMonth &&
                        (payment.status === 'Paid' || payment.status === 'Completed' || payment.status === 'completed')
                      );
                      
                      return (
                        <div key={tenant._id} className={`flex items-center justify-between p-2 rounded ${
                          alreadyPaid ? 'bg-green-50 opacity-60' : selectedTenant === tenant._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="selectedTenant"
                              value={tenant._id}
                              checked={selectedTenant === tenant._id}
                              disabled={alreadyPaid}
                              onChange={(e) => {
                                setSelectedTenant(e.target.value);
                                setFormData({ ...formData, amount: tenant.rentAmount?.toString() || '' });
                              }}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 disabled:opacity-50"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{tenant.name}</p>
                              <p className="text-sm text-gray-500">
                                Unit: {tenant.unit} | Status: {tenant.status}
                                {alreadyPaid && (
                                  <span className="text-green-600 ml-2">(Already Paid for {new Date(formData.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${tenant.rentAmount || 0}</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-gray-500 text-center py-4">No tenants found</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rent Month</label>
            <select
              value={formData.rentMonth}
              onChange={(e) => {
                setFormData({ ...formData, rentMonth: e.target.value });
                setSelectedTenant('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              {getAvailableMonths().map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

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