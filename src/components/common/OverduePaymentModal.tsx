import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, DollarSign, Calendar, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface OverduePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: () => void;
}

const OverduePaymentModal: React.FC<OverduePaymentModalProps> = ({ isOpen, onClose, onPaymentAdded }) => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [monthFilter, setMonthFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tenants and properties
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tenants');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  // Calculate overdue tenants
  const overdueTenants = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return tenants.filter((tenant: any) => {
      if (tenant.status !== 'Active' && tenant.status !== 'Late') return false;
      
      // Property filter
      if (propertyFilter && tenant.propertyId !== propertyFilter) return false;
      
      // Calculate months overdue (simplified - assumes monthly rent)
      const lastPaymentMonth = tenant.lastPaymentDate ? 
        new Date(tenant.lastPaymentDate).getMonth() : currentMonth - 2;
      const monthsOverdue = currentMonth - lastPaymentMonth;
      
      if (monthsOverdue <= 0) return false;
      
      // Month filter
      if (monthFilter) {
        const filterMonths = parseInt(monthFilter);
        if (monthsOverdue !== filterMonths) return false;
      }
      
      return true;
    }).map((tenant: any) => {
      const lastPaymentMonth = tenant.lastPaymentDate ? 
        new Date(tenant.lastPaymentDate).getMonth() : currentMonth - 2;
      const monthsOverdue = Math.max(1, currentMonth - lastPaymentMonth);
      const overdueAmount = (tenant.rentAmount || 0) * monthsOverdue;
      
      return {
        ...tenant,
        monthsOverdue,
        overdueAmount,
        propertyName: properties.find((p: any) => p._id === tenant.propertyId)?.name || 'Unknown'
      };
    });
  }, [tenants, properties, propertyFilter, monthFilter]);

  const selectedOverdueData = overdueTenants.filter(t => selectedTenants.includes(t._id));
  const totalOverdueAmount = selectedOverdueData.reduce((sum, t) => sum + t.overdueAmount, 0);

  const handleTenantSelect = (tenantId: string, selected: boolean) => {
    if (selected) {
      setSelectedTenants(prev => [...prev, tenantId]);
    } else {
      setSelectedTenants(prev => prev.filter(id => id !== tenantId));
    }
  };

  const handleSelectAll = () => {
    if (selectedTenants.length === overdueTenants.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(overdueTenants.map(t => t._id));
    }
  };

  const handleSubmit = async () => {
    if (selectedTenants.length === 0) {
      alert('Please select at least one tenant');
      return;
    }

    setIsSubmitting(true);
    try {
      const payments = selectedOverdueData.map(tenant => ({
        tenantId: tenant._id,
        propertyId: tenant.propertyId,
        amount: tenant.overdueAmount,
        paymentDate,
        paymentMethod,
        description: `Overdue payment settlement - ${tenant.monthsOverdue} months for ${tenant.name}`,
        rentMonth: new Date().toISOString().slice(0, 7),
        notes: `Overdue payment settlement - ${tenant.monthsOverdue} months`,
        status: 'Completed',
        type: 'rent',
        category: 'payment',
        auditCategory: 'payment',
        auditDescription: `Overdue payment of $${tenant.overdueAmount} settled for ${tenant.name}`
      }));

      await Promise.all(payments.map(payment => apiClient.post('/payments', payment)));
      
      alert(`Successfully recorded ${payments.length} overdue payments totaling $${totalOverdueAmount.toLocaleString()}`);
      onPaymentAdded();
      onClose();
      setSelectedTenants([]);
    } catch (error: any) {
      alert(`Failed to record payments: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Settle Overdue Payments</h3>
              <p className="text-sm text-gray-600">{overdueTenants.length} overdue tenants found</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Filter</label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Properties</option>
              {properties.map((property: any) => (
                <option key={property._id} value={property._id}>{property.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Months Overdue</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Months</option>
              <option value="1">1 Month</option>
              <option value="2">2 Months</option>
              <option value="3">3 Months</option>
              <option value="4">4+ Months</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>
        </div>

        {/* Overdue Tenants List */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedTenants.length === overdueTenants.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedTenants.length > 0 && (
              <div className="text-sm text-gray-600">
                {selectedTenants.length} selected • Total: ${totalOverdueAmount.toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {overdueTenants.map((tenant) => (
              <div
                key={tenant._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTenants.includes(tenant._id) ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleTenantSelect(tenant._id, !selectedTenants.includes(tenant._id))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTenants.includes(tenant._id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-600">
                        {tenant.propertyName} - Unit {tenant.unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">${tenant.overdueAmount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{tenant.monthsOverdue} months overdue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {overdueTenants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No overdue payments found with current filters</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedTenants.length === 0}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Processing...' : `Settle ${selectedTenants.length} Payments`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverduePaymentModal;