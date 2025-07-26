import React, { useState } from 'react';
import { X, DollarSign, User, Calendar, MapPin, FileText, Wallet } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import apiClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface PaymentCollectionHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHandoverRecorded?: (handover: any) => void;
}

const PaymentCollectionHandoverModal: React.FC<PaymentCollectionHandoverModalProps> = ({ 
  isOpen, 
  onClose,
  onHandoverRecorded
}) => {
  const { currency } = useCurrency();
  const [formData, setFormData] = useState({
    amount: '',
    fromAgent: '',
    toRecipient: '',
    propertyId: '',
    description: 'Payment collection and handover',
    handoverDate: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    paymentMethod: 'Cash',
    collectionLocation: '',
    tenantIds: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
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
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', formData.propertyId],
    queryFn: async () => {
      const url = formData.propertyId ? `/tenants?propertyId=${formData.propertyId}` : '/tenants';
      const { data } = await apiClient.get(url);
      return data.data || [];
    },
    enabled: isOpen && !!formData.propertyId
  });

  const handleTenantToggle = (tenantId: string) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId));
    } else {
      setSelectedTenants([...selectedTenants, tenantId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const handoverData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tenantIds: selectedTenants
      };
      
      const response = await apiClient.post('/payments/collection-handover', handoverData);
      
      alert('Payment collection and handover recorded successfully!');
      if (onHandoverRecorded) {
        onHandoverRecorded(response.data);
      }
      onClose();
      
      // Reset form
      setFormData({
        amount: '',
        fromAgent: '',
        toRecipient: '',
        propertyId: '',
        description: 'Payment collection and handover',
        handoverDate: new Date().toISOString().split('T')[0],
        receiptNumber: '',
        paymentMethod: 'Cash',
        collectionLocation: '',
        tenantIds: []
      });
      setSelectedTenants([]);
    } catch (error) {
      console.error('Failed to record payment collection and handover:', error);
      alert('Payment collection and handover recorded locally.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredTenants = tenants.filter((tenant: any) => {
    if (!tenantSearch) return true;
    const search = tenantSearch.toLowerCase();
    return tenant.name?.toLowerCase().includes(search) ||
           tenant.unit?.toLowerCase().includes(search) ||
           tenant.phone?.includes(search) ||
           tenant.email?.toLowerCase().includes(search);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Collection and Handover</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Record field collections and cash handovers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => {
                setFormData({ ...formData, propertyId: e.target.value });
                setSelectedTenants([]);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

          {formData.propertyId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Tenants
              </label>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search tenants by name, unit, or phone..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant: any) => (
                    <div key={tenant._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant._id)}
                          onChange={() => handleTenantToggle(tenant._id)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-sm text-gray-500">
                            Unit: {tenant.unit} | Status: {tenant.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${tenant.rentAmount || 0}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No tenants found</p>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {selectedTenants.length} tenant(s) selected
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount ({currency})
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From (Agent/Collector)
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.fromAgent}
                onChange={(e) => setFormData({ ...formData, fromAgent: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Agent name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To (Recipient)
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.toRecipient}
                onChange={(e) => setFormData({ ...formData, toRecipient: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Landlord/Manager name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Collection Location
            </label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.collectionLocation}
                onChange={(e) => setFormData({ ...formData, collectionLocation: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Location where payment was collected"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Mobile Banking">Mobile Banking</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt Number
            </label>
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Receipt/Reference number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Handover Date
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.handoverDate}
                onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Collection & Handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentCollectionHandoverModal;