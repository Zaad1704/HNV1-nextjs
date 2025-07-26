import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import apiClient from '@/lib/api';

interface Unit {
  _id: string;
  unitNumber: string;
  nickname?: string;
  alternativeName?: string;
  status: string;
  tenantId?: any;
}

interface UnitNicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
}

const UnitNicknameModal: React.FC<UnitNicknameModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyName
}) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchUnits();
    }
  }, [isOpen, propertyId]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/units/property/${propertyId}`);
      setUnits(data.data || []);
    } catch (error) {
      console.error('Failed to fetch units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (unitId: string, field: 'nickname' | 'alternativeName', value: string) => {
    setUnits(prev => prev.map(unit => 
      unit._id === unitId ? { ...unit, [field]: value } : unit
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = units.map(unit => ({
        unitId: unit._id,
        nickname: unit.nickname || '',
        alternativeName: unit.alternativeName || ''
      }));

      await apiClient.put('/units/bulk-nicknames', { updates });
      alert('Unit nicknames updated successfully!');
      onClose();
    } catch (error) {
      alert('Failed to update unit nicknames');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Unit Nicknames</h2>
              <p className="text-sm text-gray-600">{propertyName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">Loading units...</div>
          ) : units.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No units found for this property
            </div>
          ) : (
            <div className="space-y-4">
              {units.map(unit => (
                <div key={unit._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Edit3 size={16} className="text-blue-600" />
                    <span className="font-semibold">Unit {unit.unitNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      unit.status === 'Occupied' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nickname
                      </label>
                      <input
                        type="text"
                        value={unit.nickname || ''}
                        onChange={(e) => handleUnitChange(unit._id, 'nickname', e.target.value)}
                        placeholder="e.g., Corner Unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternative Name
                      </label>
                      <input
                        type="text"
                        value={unit.alternativeName || ''}
                        onChange={(e) => handleUnitChange(unit._id, 'alternativeName', e.target.value)}
                        placeholder="e.g., 6th Floor"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {unit.tenantId && (
                    <div className="mt-2 text-sm text-gray-600">
                      Tenant: {unit.tenantId.name}
                    </div>
                  )}
                </div>
              ))}
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
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitNicknameModal;