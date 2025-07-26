import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Search, Filter, CheckSquare, Square, Upload, Download } from 'lucide-react';
import apiClient from '@/lib/api';

interface Unit {
  _id: string;
  unitNumber: string;
  nickname?: string;
  alternativeName?: string;
  status: string;
  tenantId?: any;
}

interface EnhancedUnitNicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
}

const EnhancedUnitNicknameModal: React.FC<EnhancedUnitNicknameModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyName
}) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [bulkNickname, setBulkNickname] = useState('');
  const [bulkAlternativeName, setBulkAlternativeName] = useState('');
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchUnits();
    }
  }, [isOpen, propertyId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = units.filter(unit => 
        unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.nickname && unit.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (unit.alternativeName && unit.alternativeName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUnits(filtered);
    } else {
      setFilteredUnits(units);
    }
  }, [searchQuery, units]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      // Try to fetch units from API first
      const { data } = await apiClient.get(`/units/property/${propertyId}`);
      if (data.data && data.data.length > 0) {
        setUnits(data.data);
      } else {
        // Fallback: create units based on property numberOfUnits
        await createFallbackUnits();
      }
    } catch (error) {
      console.error('Failed to fetch units, creating fallback units:', error);
      // If API fails, create fallback units
      await createFallbackUnits();
    } finally {
      setLoading(false);
    }
  };

  const createFallbackUnits = async () => {
    try {
      // Get property details to know number of units
      const { data: propertyData } = await apiClient.get(`/properties/${propertyId}`);
      const property = propertyData.data;
      const numberOfUnits = property?.numberOfUnits || 1;
      
      // Get tenants to match with units
      const { data: tenantsData } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
      const tenants = tenantsData.data || [];
      
      // Create fallback units
      const fallbackUnits = Array.from({ length: numberOfUnits }, (_, i) => {
        const unitNumber = (i + 1).toString();
        const tenant = tenants.find((t: any) => t.unit === unitNumber && t.status === 'Active');
        
        return {
          _id: `fallback-${propertyId}-${unitNumber}`,
          unitNumber,
          nickname: '',
          alternativeName: '',
          status: tenant ? 'Occupied' : 'Available',
          tenantId: tenant || null
        };
      });
      
      setUnits(fallbackUnits);
    } catch (error) {
      console.error('Failed to create fallback units:', error);
      setUnits([]);
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

      await apiClient.put('/units/bulk-update', { updates });
      alert('Unit details updated successfully!');
      onClose();
    } catch (error) {
      alert('Failed to update unit details');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectUnit = (unitId: string) => {
    const newSelected = new Set(selectedUnits);
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId);
    } else {
      newSelected.add(unitId);
    }
    setSelectedUnits(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUnits.size === filteredUnits.length) {
      setSelectedUnits(new Set());
    } else {
      setSelectedUnits(new Set(filteredUnits.map(unit => unit._id)));
    }
  };

  const handleBulkApply = () => {
    const updatedUnits = units.map(unit => {
      if (selectedUnits.has(unit._id)) {
        return {
          ...unit,
          nickname: bulkNickname || unit.nickname,
          alternativeName: bulkAlternativeName || unit.alternativeName
        };
      }
      return unit;
    });
    setUnits(updatedUnits);
    setSelectedUnits(new Set());
    setBulkNickname('');
    setBulkAlternativeName('');
    setShowBulkEdit(false);
  };

  const exportData = () => {
    const csvContent = [
      ['Unit Number', 'Nickname', 'Alternative Name', 'Status', 'Tenant'],
      ...units.map(unit => [
        unit.unitNumber,
        unit.nickname || '',
        unit.alternativeName || '',
        unit.status,
        unit.tenantId?.name || 'Vacant'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${propertyName}_units.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Unit Management</h2>
              <p className="text-sm text-gray-600">{propertyName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search units by number or nickname..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowBulkEdit(!showBulkEdit)}
              className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <Edit3 size={16} />
              Bulk Edit
            </button>
            <button
              onClick={exportData}
              className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
          
          {/* Bulk Edit Panel */}
          {showBulkEdit && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-purple-900">Bulk Edit Selected Units ({selectedUnits.size})</h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  {selectedUnits.size === filteredUnits.length ? <CheckSquare size={16} /> : <Square size={16} />}
                  {selectedUnits.size === filteredUnits.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={bulkNickname}
                  onChange={(e) => setBulkNickname(e.target.value)}
                  placeholder="Bulk nickname (optional)"
                  className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  type="text"
                  value={bulkAlternativeName}
                  onChange={(e) => setBulkAlternativeName(e.target.value)}
                  placeholder="Bulk alternative name (optional)"
                  className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleBulkApply}
                disabled={selectedUnits.size === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply to {selectedUnits.size} units
              </button>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">Loading units...</div>
          ) : filteredUnits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? `No units found matching "${searchQuery}"` : 'No units found for this property'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUnits.map(unit => (
                <div key={unit._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {showBulkEdit && (
                      <button
                        onClick={() => handleSelectUnit(unit._id)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        {selectedUnits.has(unit._id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    )}
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

export default EnhancedUnitNicknameModal;