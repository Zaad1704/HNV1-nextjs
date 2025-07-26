import React, { useState } from 'react';
import { X, Calendar, FileText, Save, AlertTriangle } from 'lucide-react';

interface BulkLeaseRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  expiringLeases: any[];
  property: any;
  onSuccess: () => void;
}

const BulkLeaseRenewalModal: React.FC<BulkLeaseRenewalModalProps> = ({
  isOpen,
  onClose,
  expiringLeases,
  property,
  onSuccess
}) => {
  const [renewalData, setRenewalData] = useState({
    newLeaseTerm: '12',
    rentIncrease: {
      type: 'percentage',
      value: '3'
    },
    startDate: 'lease_end',
    customStartDate: '',
    notifyTenants: true,
    generateDocuments: true,
    selectedLeases: [] as string[]
  });

  const [processing, setProcessing] = useState(false);

  const handleLeaseToggle = (leaseId: string) => {
    setRenewalData(prev => ({
      ...prev,
      selectedLeases: prev.selectedLeases.includes(leaseId)
        ? prev.selectedLeases.filter(id => id !== leaseId)
        : [...prev.selectedLeases, leaseId]
    }));
  };

  const selectAll = () => {
    setRenewalData(prev => ({
      ...prev,
      selectedLeases: prev.selectedLeases.length === expiringLeases.length 
        ? [] 
        : expiringLeases.map(lease => lease._id)
    }));
  };

  const calculateNewRent = (currentRent: number) => {
    if (renewalData.rentIncrease.type === 'percentage') {
      return currentRent + (currentRent * (Number(renewalData.rentIncrease.value) / 100));
    } else {
      return currentRent + Number(renewalData.rentIncrease.value);
    }
  };

  const getTotalRentIncrease = () => {
    const selectedLeaseData = expiringLeases.filter(lease => 
      renewalData.selectedLeases.includes(lease._id)
    );
    
    return selectedLeaseData.reduce((total, lease) => {
      const currentRent = lease.rentAmount || 0;
      const newRent = calculateNewRent(currentRent);
      return total + (newRent - currentRent);
    }, 0);
  };

  const handleRenewal = async () => {
    if (renewalData.selectedLeases.length === 0) {
      alert('Please select at least one lease to renew');
      return;
    }

    if (!confirm(`Renew ${renewalData.selectedLeases.length} lease(s)? This will generate new lease agreements and update rent amounts.`)) {
      return;
    }

    setProcessing(true);
    try {
      const selectedLeaseData = expiringLeases.filter(lease => 
        renewalData.selectedLeases.includes(lease._id)
      );

      // Simulate lease renewal process
      for (const lease of selectedLeaseData) {
        const currentRent = lease.rentAmount || 0;
        const newRent = calculateNewRent(currentRent);
        const startDate = renewalData.startDate === 'lease_end' 
          ? new Date(lease.leaseEndDate)
          : new Date(renewalData.customStartDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + Number(renewalData.newLeaseTerm));

        const renewalRecord = {
          originalLeaseId: lease._id,
          tenantId: lease.tenantId,
          propertyId: property._id,
          unitNumber: lease.unit,
          oldRent: currentRent,
          newRent: newRent,
          newLeaseStart: startDate.toISOString(),
          newLeaseEnd: endDate.toISOString(),
          leaseTerm: Number(renewalData.newLeaseTerm),
          rentIncrease: newRent - currentRent,
          status: 'pending_signature',
          createdAt: new Date().toISOString()
        };

        console.log('Lease renewal record:', renewalRecord);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      alert(`${renewalData.selectedLeases.length} lease(s) renewed successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to process lease renewals');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-600" size={24} />
                Bulk Lease Renewal
              </h2>
              <p className="text-sm text-gray-600">
                {property.name} - {expiringLeases.length} expiring lease(s)
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {/* Renewal Settings */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Renewal Terms</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Lease Term (months)
                    </label>
                    <select
                      value={renewalData.newLeaseTerm}
                      onChange={(e) => setRenewalData({ ...renewalData, newLeaseTerm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="18">18 months</option>
                      <option value="24">24 months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rent Increase
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={renewalData.rentIncrease.type}
                        onChange={(e) => setRenewalData({
                          ...renewalData,
                          rentIncrease: { ...renewalData.rentIncrease, type: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">$</option>
                      </select>
                      <input
                        type="number"
                        value={renewalData.rentIncrease.value}
                        onChange={(e) => setRenewalData({
                          ...renewalData,
                          rentIncrease: { ...renewalData.rentIncrease, value: e.target.value }
                        })}
                        placeholder="0"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Lease Start Date
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="lease_end"
                          checked={renewalData.startDate === 'lease_end'}
                          onChange={(e) => setRenewalData({ ...renewalData, startDate: e.target.value })}
                        />
                        <span>Day after current lease ends</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="custom"
                          checked={renewalData.startDate === 'custom'}
                          onChange={(e) => setRenewalData({ ...renewalData, startDate: e.target.value })}
                        />
                        <span>Custom date</span>
                      </label>
                      {renewalData.startDate === 'custom' && (
                        <input
                          type="date"
                          value={renewalData.customStartDate}
                          onChange={(e) => setRenewalData({ ...renewalData, customStartDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Options</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={renewalData.notifyTenants}
                      onChange={(e) => setRenewalData({ ...renewalData, notifyTenants: e.target.checked })}
                    />
                    <span>Send renewal notices to tenants</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={renewalData.generateDocuments}
                      onChange={(e) => setRenewalData({ ...renewalData, generateDocuments: e.target.checked })}
                    />
                    <span>Generate new lease documents</span>
                  </label>
                </div>

                {/* Summary */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Renewal Summary</h4>
                  <div className="text-sm space-y-1">
                    <div>Selected Leases: <strong>{renewalData.selectedLeases.length}</strong></div>
                    <div>New Term: <strong>{renewalData.newLeaseTerm} months</strong></div>
                    <div>Total Rent Increase: <strong>${getTotalRentIncrease().toFixed(2)}/month</strong></div>
                    <div>Annual Increase: <strong>${(getTotalRentIncrease() * 12).toFixed(2)}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lease Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Select Leases to Renew</h3>
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {renewalData.selectedLeases.length === expiringLeases.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {expiringLeases.map((lease) => (
                  <div
                    key={lease._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      renewalData.selectedLeases.includes(lease._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleLeaseToggle(lease._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={renewalData.selectedLeases.includes(lease._id)}
                          onChange={() => handleLeaseToggle(lease._id)}
                          className="rounded"
                        />
                        <div>
                          <div className="font-medium">{lease.tenantName}</div>
                          <div className="text-sm text-gray-600">
                            Unit {lease.unit} • Expires: {new Date(lease.leaseEndDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${lease.rentAmount || 0} → ${calculateNewRent(lease.rentAmount || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-green-600">
                          +${(calculateNewRent(lease.rentAmount || 0) - (lease.rentAmount || 0)).toFixed(2)}/month
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-yellow-900">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                    <li>• Tenants will receive renewal notices if enabled</li>
                    <li>• New lease documents will be generated automatically</li>
                    <li>• Rent increases will take effect on the new lease start date</li>
                    <li>• This action cannot be undone once processed</li>
                  </ul>
                </div>
              </div>
            </div>
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
            onClick={handleRenewal}
            disabled={processing || renewalData.selectedLeases.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {processing ? 'Processing...' : `Renew ${renewalData.selectedLeases.length} Lease(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkLeaseRenewalModal;