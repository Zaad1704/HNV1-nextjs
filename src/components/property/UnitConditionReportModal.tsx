import React, { useState } from 'react';
import { X, Camera, Upload, Save, Plus, Trash2 } from 'lucide-react';

interface UnitConditionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'move-in' | 'move-out';
  unitNumber: string;
  tenantName: string;
  propertyName: string;
  onSave: (reportData: any) => void;
}

const UnitConditionReportModal: React.FC<UnitConditionReportModalProps> = ({
  isOpen,
  onClose,
  type,
  unitNumber,
  tenantName,
  propertyName,
  onSave
}) => {
  const [reportData, setReportData] = useState({
    generalCondition: 'good',
    rooms: [
      { name: 'Living Room', condition: 'good', notes: '', images: [] },
      { name: 'Kitchen', condition: 'good', notes: '', images: [] },
      { name: 'Bedroom', condition: 'good', notes: '', images: [] },
      { name: 'Bathroom', condition: 'good', notes: '', images: [] }
    ],
    utilities: {
      electricity: 'working',
      plumbing: 'working',
      heating: 'working',
      airConditioning: 'working'
    },
    appliances: [
      { name: 'Refrigerator', condition: 'good', working: true },
      { name: 'Stove', condition: 'good', working: true },
      { name: 'Dishwasher', condition: 'good', working: true }
    ],
    damages: [],
    overallNotes: '',
    inspectorName: '',
    tenantSignature: false,
    landlordSignature: false
  });

  const [newDamage, setNewDamage] = useState({ description: '', severity: 'minor', cost: '' });

  const conditionOptions = [
    { value: 'excellent', label: 'Excellent', color: 'text-green-600' },
    { value: 'good', label: 'Good', color: 'text-blue-600' },
    { value: 'fair', label: 'Fair', color: 'text-yellow-600' },
    { value: 'poor', label: 'Poor', color: 'text-red-600' }
  ];

  const handleImageUpload = (roomIndex: number, files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setReportData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, index) => 
        index === roomIndex 
          ? { ...room, images: [...room.images, ...newImages] }
          : room
      )
    }));
  };

  const addDamage = () => {
    if (newDamage.description.trim()) {
      setReportData(prev => ({
        ...prev,
        damages: [...prev.damages, { ...newDamage, id: Date.now() }]
      }));
      setNewDamage({ description: '', severity: 'minor', cost: '' });
    }
  };

  const removeDamage = (damageId: number) => {
    setReportData(prev => ({
      ...prev,
      damages: prev.damages.filter((d: any) => d.id !== damageId)
    }));
  };

  const handleSave = () => {
    const completeReport = {
      ...reportData,
      type,
      unitNumber,
      tenantName,
      propertyName,
      date: new Date().toISOString(),
      reportId: `${type}-${unitNumber}-${Date.now()}`
    };
    
    onSave(completeReport);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {type === 'move-in' ? 'Move-In' : 'Move-Out'} Condition Report
              </h2>
              <p className="text-sm text-gray-600">
                {propertyName} - Unit {unitNumber} - {tenantName}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {/* General Condition */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Overall Unit Condition</h3>
              <select
                value={reportData.generalCondition}
                onChange={(e) => setReportData({ ...reportData, generalCondition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {conditionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Room by Room Inspection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Room Inspection</h3>
              <div className="space-y-4">
                {reportData.rooms.map((room, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{room.name}</h4>
                      <select
                        value={room.condition}
                        onChange={(e) => setReportData(prev => ({
                          ...prev,
                          rooms: prev.rooms.map((r, i) => 
                            i === index ? { ...r, condition: e.target.value } : r
                          )
                        }))}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        {conditionOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <textarea
                      value={room.notes}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        rooms: prev.rooms.map((r, i) => 
                          i === index ? { ...r, notes: e.target.value } : r
                        )
                      }))}
                      placeholder="Notes about this room..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                    />

                    {/* Image Upload */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg cursor-pointer hover:bg-blue-200 text-sm">
                        <Camera size={14} />
                        Add Photos
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files)}
                          className="hidden"
                        />
                      </label>
                      {room.images.length > 0 && (
                        <span className="text-sm text-gray-600">{room.images.length} photo(s)</span>
                      )}
                    </div>

                    {/* Image Preview */}
                    {room.images.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {room.images.map((image: any, imgIndex: number) => (
                          <img
                            key={imgIndex}
                            src={image.url}
                            alt={`${room.name} ${imgIndex + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Utilities Check */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Utilities</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(reportData.utilities).map(([utility, status]) => (
                  <div key={utility} className="flex items-center justify-between">
                    <span className="capitalize">{utility.replace(/([A-Z])/g, ' $1')}</span>
                    <select
                      value={status}
                      onChange={(e) => setReportData(prev => ({
                        ...prev,
                        utilities: { ...prev.utilities, [utility]: e.target.value }
                      }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="working">Working</option>
                      <option value="not-working">Not Working</option>
                      <option value="needs-repair">Needs Repair</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Damages */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Damages & Issues</h3>
              
              {/* Add New Damage */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={newDamage.description}
                    onChange={(e) => setNewDamage({ ...newDamage, description: e.target.value })}
                    placeholder="Damage description..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <select
                    value={newDamage.severity}
                    onChange={(e) => setNewDamage({ ...newDamage, severity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="major">Major</option>
                  </select>
                  <input
                    type="number"
                    value={newDamage.cost}
                    onChange={(e) => setNewDamage({ ...newDamage, cost: e.target.value })}
                    placeholder="Estimated cost"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={addDamage}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                >
                  <Plus size={14} />
                  Add Damage
                </button>
              </div>

              {/* Damages List */}
              {reportData.damages.length > 0 && (
                <div className="space-y-2">
                  {reportData.damages.map((damage: any) => (
                    <div key={damage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{damage.description}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          damage.severity === 'major' ? 'bg-red-100 text-red-800' :
                          damage.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {damage.severity}
                        </span>
                        {damage.cost && <span className="ml-2 text-sm text-gray-600">${damage.cost}</span>}
                      </div>
                      <button
                        onClick={() => removeDamage(damage.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overall Notes */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Additional Notes</h3>
              <textarea
                value={reportData.overallNotes}
                onChange={(e) => setReportData({ ...reportData, overallNotes: e.target.value })}
                placeholder="Any additional observations or notes..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Inspector Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Inspector Information</h3>
              <input
                type="text"
                value={reportData.inspectorName}
                onChange={(e) => setReportData({ ...reportData, inspectorName: e.target.value })}
                placeholder="Inspector name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Signatures */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Acknowledgment</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reportData.tenantSignature}
                    onChange={(e) => setReportData({ ...reportData, tenantSignature: e.target.checked })}
                  />
                  <span>Tenant acknowledges the condition report</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reportData.landlordSignature}
                    onChange={(e) => setReportData({ ...reportData, landlordSignature: e.target.checked })}
                  />
                  <span>Landlord/Agent acknowledges the condition report</span>
                </label>
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
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={16} />
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitConditionReportModal;