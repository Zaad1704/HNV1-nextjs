import React, { useState } from 'react';
import { X, TrendingUp, Save, Calendar, DollarSign, Users } from 'lucide-react';

interface RentIncreaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  tenants: any[];
  onSuccess: () => void;
}

const RentIncreaseModal: React.FC<RentIncreaseModalProps> = ({
  isOpen,
  onClose,
  property,
  tenants,
  onSuccess
}) => {
  const [increaseData, setIncreaseData] = useState({
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    reason: 'Annual rent adjustment',
    notifyTenants: true,
    selectedTenants: [] as string[],
    applyToAll: true
  });

  const [processing, setProcessing] = useState(false);

  const activeTenants = tenants.filter(t => t.status === 'Active');

  const calculateNewRent = (currentRent: number) => {
    if (increaseData.type === 'percentage') {
      return currentRent + (currentRent * (Number(increaseData.value) / 100));
    } else {
      return currentRent + Number(increaseData.value);
    }
  };

  const getTotalIncrease = () => {
    const tenantsToUpdate = increaseData.applyToAll 
      ? activeTenants 
      : activeTenants.filter(t => increaseData.selectedTenants.includes(t._id));
    
    return tenantsToUpdate.reduce((total, tenant) => {
      const currentRent = tenant.rentAmount || 0;
      const newRent = calculateNewRent(currentRent);
      return total + (newRent - currentRent);
    }, 0);
  };

  const handleTenantToggle = (tenantId: string) => {
    setIncreaseData(prev => ({
      ...prev,
      selectedTenants: prev.selectedTenants.includes(tenantId)
        ? prev.selectedTenants.filter(id => id !== tenantId)
        : [...prev.selectedTenants, tenantId]
    }));
  };

  const handleApply = async () => {
    if (!increaseData.value || Number(increaseData.value) <= 0) {
      alert('Please enter a valid increase amount');
      return;
    }

    const tenantsToUpdate = increaseData.applyToAll 
      ? activeTenants 
      : activeTenants.filter(t => increaseData.selectedTenants.includes(t._id));

    if (tenantsToUpdate.length === 0) {
      alert('Please select at least one tenant');
      return;
    }

    if (!confirm(`Apply rent increase to ${tenantsToUpdate.length} tenant(s)? This will increase total monthly revenue by $${getTotalIncrease().toFixed(2)}.`)) {
      return;
    }

    setProcessing(true);
    try {
      // Simulate API calls to update tenant rents
      for (const tenant of tenantsToUpdate) {
        const currentRent = tenant.rentAmount || 0;
        const newRent = calculateNewRent(currentRent);
        
        // In a real app, this would be an API call
        console.log(`Updating tenant ${tenant.name} rent from $${currentRent} to $${newRent}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create rent increase record
      const increaseRecord = {
        propertyId: property._id,
        propertyName: property.name,
        type: increaseData.type,
        value: Number(increaseData.value),
        effectiveDate: increaseData.effectiveDate,
        reason: increaseData.reason,
        appliedTo: tenantsToUpdate.map(t => ({
          tenantId: t._id,
          tenantName: t.name,
          unit: t.unit,
          oldRent: t.rentAmount || 0,
          newRent: calculateNewRent(t.rentAmount || 0)
        })),
        totalIncrease: getTotalIncrease(),
        createdAt: new Date().toISOString(),
        notificationSent: increaseData.notifyTenants
      };

      console.log('Rent increase record:', increaseRecord);

      alert(`Rent increase applied successfully to ${tenantsToUpdate.length} tenant(s)!`);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to apply rent increase. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={24} />
                Rent Increase
              </h2>
              <p className="text-sm text-gray-600">{property.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {/* Increase Type and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Increase Type
                </label>
                <select
                  value={increaseData.type}
                  onChange={(e) => setIncreaseData({ ...increaseData, type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {increaseData.type === 'percentage' ? 'Percentage' : 'Amount'}
                </label>
                <div className="relative">
                  {increaseData.type === 'fixed' && (
                    <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  )}
                  <input
                    type="number"
                    value={increaseData.value}
                    onChange={(e) => setIncreaseData({ ...increaseData, value: e.target.value })}
                    placeholder={increaseData.type === 'percentage' ? '5' : '100'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      increaseData.type === 'fixed' ? 'pl-9' : ''
                    }`}
                  />
                  {increaseData.type === 'percentage' && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Effective Date and Reason */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={increaseData.effectiveDate}
                    onChange={(e) => setIncreaseData({ ...increaseData, effectiveDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={increaseData.reason}
                  onChange={(e) => setIncreaseData({ ...increaseData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Annual rent adjustment">Annual rent adjustment</option>
                  <option value="Market rate increase">Market rate increase</option>
                  <option value="Property improvements">Property improvements</option>
                  <option value="Increased operating costs">Increased operating costs</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Apply to All or Select Tenants */}
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={increaseData.applyToAll}
                  onChange={(e) => setIncreaseData({ 
                    ...increaseData, 
                    applyToAll: e.target.checked,
                    selectedTenants: e.target.checked ? [] : increaseData.selectedTenants
                  })}
                />
                <span className="font-medium">Apply to all active tenants</span>
              </label>

              {!increaseData.applyToAll && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Select Tenants</h4>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {activeTenants.map((tenant) => (
                      <label
                        key={tenant._id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={increaseData.selectedTenants.includes(tenant._id)}
                          onChange={() => handleTenantToggle(tenant._id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-gray-600">
                            Unit {tenant.unit} • Current: ${tenant.rentAmount || 0} • 
                            New: ${calculateNewRent(tenant.rentAmount || 0).toFixed(2)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Option */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={increaseData.notifyTenants}
                  onChange={(e) => setIncreaseData({ ...increaseData, notifyTenants: e.target.checked })}
                />
                <span>Send notification to affected tenants</span>
              </label>
            </div>

            {/* Summary */}
            {increaseData.value && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Increase Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Affected Tenants:</span>
                    <span className="font-bold ml-2">
                      {increaseData.applyToAll ? activeTenants.length : increaseData.selectedTenants.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Monthly Increase:</span>
                    <span className="font-bold ml-2">${getTotalIncrease().toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Annual Increase:</span>
                    <span className="font-bold ml-2">${(getTotalIncrease() * 12).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Effective Date:</span>
                    <span className="font-bold ml-2">{new Date(increaseData.effectiveDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={processing || !increaseData.value}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {processing ? 'Applying...' : 'Apply Rent Increase'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentIncreaseModal;