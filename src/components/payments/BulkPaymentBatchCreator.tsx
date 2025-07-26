import React, { useState, useEffect } from 'react';
import { X, Save, Users, Building2, Filter, CreditCard } from 'lucide-react';
import apiClient from '@/lib/api';

interface Property {
  _id: string;
  name: string;
}

interface Tenant {
  _id: string;
  name: string;
  email: string;
  rentAmount: number;
  propertyId: any;
}

interface BulkPaymentBatchCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkPaymentBatchCreator: React.FC<BulkPaymentBatchCreatorProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    batchName: '',
    batchType: 'rent_collection',
    selectedProperties: [] as string[],
    selectedTenants: [] as string[],
    paymentDetails: {
      amount: '',
      description: 'Monthly Rent Payment',
      paymentMethod: 'Bank Transfer',
      dueDate: new Date().toISOString().split('T')[0],
      autoProcess: false
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, tenantsRes] = await Promise.all([
        apiClient.get('/properties'),
        apiClient.get('/tenants')
      ]);
      setProperties(propertiesRes.data.data || []);
      setTenants(tenantsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyToggle = (propertyId: string) => {
    const newSelected = formData.selectedProperties.includes(propertyId)
      ? formData.selectedProperties.filter(id => id !== propertyId)
      : [...formData.selectedProperties, propertyId];
    
    setFormData({ ...formData, selectedProperties: newSelected });
  };

  const handleTenantToggle = (tenantId: string) => {
    const newSelected = formData.selectedTenants.includes(tenantId)
      ? formData.selectedTenants.filter(id => id !== tenantId)
      : [...formData.selectedTenants, tenantId];
    
    setFormData({ ...formData, selectedTenants: newSelected });
  };

  const getFilteredTenants = () => {
    if (formData.selectedProperties.length === 0) return tenants;
    return tenants.filter(tenant => 
      formData.selectedProperties.includes(tenant.propertyId?._id || tenant.propertyId)
    );
  };

  const getSelectedTenantsCount = () => {
    const filteredTenants = getFilteredTenants();
    return formData.selectedTenants.length > 0 
      ? formData.selectedTenants.length 
      : filteredTenants.length;
  };

  const getTotalAmount = () => {
    const filteredTenants = getFilteredTenants();
    const selectedTenants = formData.selectedTenants.length > 0
      ? filteredTenants.filter(t => formData.selectedTenants.includes(t._id))
      : filteredTenants;

    if (formData.paymentDetails.amount) {
      return selectedTenants.length * Number(formData.paymentDetails.amount);
    }
    
    return selectedTenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0);
  };

  const handleSubmit = async () => {
    if (!formData.batchName.trim()) {
      alert('Please enter a batch name');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        batchName: formData.batchName,
        batchType: formData.batchType,
        filters: {
          propertyIds: formData.selectedProperties.length > 0 ? formData.selectedProperties : undefined,
          tenantIds: formData.selectedTenants.length > 0 ? formData.selectedTenants : undefined
        },
        paymentDetails: {
          ...formData.paymentDetails,
          amount: formData.paymentDetails.amount ? Number(formData.paymentDetails.amount) : undefined,
          dueDate: new Date(formData.paymentDetails.dueDate)
        }
      };

      await apiClient.post('/enhanced-bulk-payment/batch', payload);
      alert('Bulk payment batch created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to create bulk payment batch');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create Bulk Payment Batch</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">Loading data...</div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={formData.batchName}
                    onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                    placeholder="e.g., January 2024 Rent Collection"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Type
                  </label>
                  <select
                    value={formData.batchType}
                    onChange={(e) => setFormData({ ...formData, batchType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="rent_collection">Rent Collection</option>
                    <option value="late_fees">Late Fees</option>
                    <option value="deposits">Security Deposits</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (leave empty for tenant's rent amount)
                    </label>
                    <input
                      type="number"
                      value={formData.paymentDetails.amount}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, amount: e.target.value }
                      })}
                      placeholder="Optional fixed amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDetails.dueDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, dueDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.paymentDetails.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, description: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentDetails.paymentMethod}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, paymentMethod: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Check">Check</option>
                      <option value="Online">Online Payment</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.paymentDetails.autoProcess}
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentDetails: { ...formData.paymentDetails, autoProcess: e.target.checked }
                      })}
                    />
                    <span className="text-sm text-gray-700">Auto-process payments (mark as completed)</span>
                  </label>
                </div>
              </div>

              {/* Property Selection */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 size={16} />
                  Select Properties (optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {properties.map((property) => (
                    <label key={property._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.selectedProperties.includes(property._id)}
                        onChange={() => handlePropertyToggle(property._id)}
                      />
                      <span className="text-sm">{property.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Batch Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Selected Tenants:</span>
                    <span className="font-bold ml-2">{getSelectedTenantsCount()}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Amount:</span>
                    <span className="font-bold ml-2">${getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !formData.batchName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkPaymentBatchCreator;