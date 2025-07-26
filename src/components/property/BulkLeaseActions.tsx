import React, { useState } from 'react';
import { FileText, TrendingUp, Calendar, X, AlertTriangle } from 'lucide-react';

interface BulkLeaseActionsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties: any[];
  onAction: (action: string, data: any) => void;
}

const BulkLeaseActions: React.FC<BulkLeaseActionsProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  onAction
}) => {
  const [activeTab, setActiveTab] = useState<'renew' | 'increase' | 'terminate'>('renew');
  const [renewalData, setRenewalData] = useState({
    duration: '12',
    startDate: '',
    rentIncrease: '0'
  });
  const [increaseData, setIncreaseData] = useState({
    percentage: '5',
    effectiveDate: '',
    noticeDate: ''
  });
  const [terminationData, setTerminationData] = useState({
    terminationDate: '',
    noticeDate: '',
    reason: 'lease_end'
  });

  if (!isOpen) return null;

  const totalTenants = selectedProperties.reduce((sum, prop) => sum + (prop.activeTenants || 0), 0);
  const totalUnits = selectedProperties.reduce((sum, prop) => sum + (prop.numberOfUnits || 0), 0);

  const handleRenewal = () => {
    onAction('bulk_renewal', {
      properties: selectedProperties.map(p => p._id),
      ...renewalData
    });
  };

  const handleIncrease = () => {
    onAction('bulk_increase', {
      properties: selectedProperties.map(p => p._id),
      ...increaseData
    });
  };

  const handleTermination = () => {
    onAction('bulk_termination', {
      properties: selectedProperties.map(p => p._id),
      ...terminationData
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">Bulk Lease Actions</h2>
            <p className="text-sm text-gray-700">
              {selectedProperties.length} properties • {totalTenants} tenants • {totalUnits} units
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('renew')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'renew' ? 'border-b-2 border-orange-400 text-orange-600' : 'text-gray-600'
            }`}
          >
            <FileText size={16} />
            Renew Leases
          </button>
          <button
            onClick={() => setActiveTab('increase')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'increase' ? 'border-b-2 border-orange-400 text-orange-600' : 'text-gray-600'
            }`}
          >
            <TrendingUp size={16} />
            Rent Increase
          </button>
          <button
            onClick={() => setActiveTab('terminate')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'terminate' ? 'border-b-2 border-orange-400 text-orange-600' : 'text-gray-600'
            }`}
          >
            <AlertTriangle size={16} />
            Terminate
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'renew' && (
            <div className="space-y-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2">Lease Renewal</h3>
                <p className="text-sm text-gray-700">
                  Renew leases for all active tenants in selected properties
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Duration (months)
                  </label>
                  <select
                    value={renewalData.duration}
                    onChange={(e) => setRenewalData({...renewalData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={renewalData.startDate}
                    onChange={(e) => setRenewalData({...renewalData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rent Increase (%)
                  </label>
                  <input
                    type="number"
                    value={renewalData.rentIncrease}
                    onChange={(e) => setRenewalData({...renewalData, rentIncrease: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
                    placeholder="0"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'increase' && (
            <div className="space-y-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2">Rent Increase</h3>
                <p className="text-sm text-gray-700">
                  Apply rent increase to all tenants in selected properties
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Increase Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={increaseData.percentage}
                    onChange={(e) => setIncreaseData({...increaseData, percentage: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                    min="0"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={increaseData.effectiveDate}
                    onChange={(e) => setIncreaseData({...increaseData, effectiveDate: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Date
                  </label>
                  <input
                    type="date"
                    value={increaseData.noticeDate}
                    onChange={(e) => setIncreaseData({...increaseData, noticeDate: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminate' && (
            <div className="space-y-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <h3 className="font-semibold text-red-700 mb-2">Lease Termination</h3>
                <p className="text-sm text-gray-700">
                  Terminate leases for tenants in selected properties
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Termination Date
                  </label>
                  <input
                    type="date"
                    value={terminationData.terminationDate}
                    onChange={(e) => setTerminationData({...terminationData, terminationDate: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Date
                  </label>
                  <input
                    type="date"
                    value={terminationData.noticeDate}
                    onChange={(e) => setTerminationData({...terminationData, noticeDate: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <select
                    value={terminationData.reason}
                    onChange={(e) => setTerminationData({...terminationData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700"
                  >
                    <option value="lease_end">Lease End</option>
                    <option value="non_payment">Non-Payment</option>
                    <option value="violation">Lease Violation</option>
                    <option value="property_sale">Property Sale</option>
                    <option value="renovation">Renovation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (activeTab === 'renew') handleRenewal();
              else if (activeTab === 'increase') handleIncrease();
              else handleTermination();
            }}
            className="px-6 py-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-lg hover:from-orange-500 hover:to-blue-500"
          >
            {activeTab === 'renew' ? 'Renew Leases' : 
             activeTab === 'increase' ? 'Apply Increase' : 'Terminate Leases'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkLeaseActions;