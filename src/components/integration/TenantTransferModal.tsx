import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Save, Search } from 'lucide-react';
import apiClient from '@/lib/api';

interface Unit {
  _id: string;
  unitNumber: string;
  nickname?: string;
  status: string;
  propertyId: any;
  rentAmount?: number;
}

interface TenantTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    _id: string;
    name: string;
    email: string;
    unit: string;
    propertyId: string;
    rentAmount: number;
  };
  currentUnit: Unit;
  onSuccess: () => void;
}

const TenantTransferModal: React.FC<TenantTransferModalProps> = ({
  isOpen,
  onClose,
  tenant,
  currentUnit,
  onSuccess
}) => {
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUnits();
    }
  }, [isOpen]);

  const fetchAvailableUnits = async () => {
    try {
      const { data } = await apiClient.get('/units/search', {
        params: { query: '', status: 'Available' }
      });
      setAvailableUnits(data.data || []);
    } catch (error) {
      console.error('Failed to fetch available units:', error);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUnit) {
      alert('Please select a unit to transfer to');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/cross-integration/tenant/transfer', {
        tenantId: tenant._id,
        fromUnitId: currentUnit._id,
        toUnitId: selectedUnit._id,
        transferDate,
        reason,
        notes
      });

      alert('Tenant transfer completed successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to process tenant transfer');
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = availableUnits.filter(unit =>
    unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (unit.nickname && unit.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (unit.propertyId?.name && unit.propertyId.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const rentDifference = selectedUnit ? (selectedUnit.rentAmount || 0) - tenant.rentAmount : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transfer Tenant</h2>
              <p className="text-sm text-gray-600">{tenant.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {/* Current Unit */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Current Unit</h3>
            <div className="text-sm text-blue-800">
              <div>Unit {currentUnit.unitNumber}
                {currentUnit.nickname && ` (${currentUnit.nickname})`}
              </div>
              <div>Rent: ${tenant.rentAmount}/month</div>
            </div>
          </div>

          {/* Transfer Arrow */}
          <div className="flex justify-center">
            <ArrowRight size={24} className="text-gray-400" />
          </div>

          {/* Available Units */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Select New Unit</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search units by number, nickname, or property..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Units List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredUnits.map((unit) => (
                <label
                  key={unit._id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedUnit?._id === unit._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedUnit"
                    checked={selectedUnit?._id === unit._id}
                    onChange={() => setSelectedUnit(unit)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      Unit {unit.unitNumber}
                      {unit.nickname && ` (${unit.nickname})`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {unit.propertyId?.name} • ${unit.rentAmount || 0}/month
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Rent Comparison */}
          {selectedUnit && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Rent Comparison</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Current</div>
                  <div className="font-medium">${tenant.rentAmount}</div>
                </div>
                <div>
                  <div className="text-gray-600">New</div>
                  <div className="font-medium">${selectedUnit.rentAmount || 0}</div>
                </div>
                <div>
                  <div className="text-gray-600">Difference</div>
                  <div className={`font-medium ${rentDifference > 0 ? 'text-red-600' : rentDifference < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {rentDifference > 0 ? '+' : ''}${rentDifference}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Date
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Transfer
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select reason...</option>
                <option value="tenant_request">Tenant Request</option>
                <option value="unit_maintenance">Unit Maintenance</option>
                <option value="rent_adjustment">Rent Adjustment</option>
                <option value="property_upgrade">Property Upgrade</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the transfer..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
            onClick={handleTransfer}
            disabled={!selectedUnit || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Processing...' : 'Transfer Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantTransferModal;