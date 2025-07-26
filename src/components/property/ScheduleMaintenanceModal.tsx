import React, { useState } from 'react';
import { X, Wrench, Save, Calendar, User, AlertTriangle } from 'lucide-react';

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onSuccess: () => void;
}

const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess
}) => {
  const [maintenanceData, setMaintenanceData] = useState({
    type: 'routine',
    category: 'plumbing',
    title: '',
    description: '',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    estimatedDuration: '2',
    assignedTo: '',
    unitNumber: '',
    recurring: false,
    recurringInterval: 'monthly',
    estimatedCost: '',
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  const maintenanceTypes = [
    { value: 'routine', label: 'Routine Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'preventive', label: 'Preventive' }
  ];

  const categories = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'appliances', label: 'Appliances' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'painting', label: 'Painting' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'security', label: 'Security' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleSubmit = async () => {
    if (!maintenanceData.title.trim()) {
      alert('Please enter a maintenance title');
      return;
    }

    if (!maintenanceData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    setSaving(true);
    try {
      const maintenanceRequest = {
        ...maintenanceData,
        propertyId: property._id,
        propertyName: property.name,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        requestId: `MAINT-${Date.now()}`,
        estimatedCost: maintenanceData.estimatedCost ? Number(maintenanceData.estimatedCost) : 0
      };

      // Simulate API call
      console.log('Creating maintenance request:', maintenanceRequest);
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Maintenance scheduled successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to schedule maintenance');
    } finally {
      setSaving(false);
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
                <Wrench className="text-orange-600" size={24} />
                Schedule Maintenance
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
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Type
                </label>
                <select
                  value={maintenanceData.type}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {maintenanceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={maintenanceData.category}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={maintenanceData.title}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, title: e.target.value })}
                placeholder="e.g., Fix leaky faucet in Unit 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={maintenanceData.description}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })}
                placeholder="Detailed description of the maintenance work needed..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Priority and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={maintenanceData.priority}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Number (Optional)
                </label>
                <input
                  type="text"
                  value={maintenanceData.unitNumber}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, unitNumber: e.target.value })}
                  placeholder="e.g., 5, A1, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={maintenanceData.scheduledDate}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, scheduledDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  value={maintenanceData.estimatedDuration}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, estimatedDuration: e.target.value })}
                  placeholder="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Assignment and Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={maintenanceData.assignedTo}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, assignedTo: e.target.value })}
                    placeholder="Contractor name or company"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost ($)
                </label>
                <input
                  type="number"
                  value={maintenanceData.estimatedCost}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, estimatedCost: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Recurring Maintenance */}
            <div>
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={maintenanceData.recurring}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, recurring: e.target.checked })}
                />
                <span className="font-medium">Recurring Maintenance</span>
              </label>
              
              {maintenanceData.recurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurring Interval
                  </label>
                  <select
                    value={maintenanceData.recurringInterval}
                    onChange={(e) => setMaintenanceData({ ...maintenanceData, recurringInterval: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={maintenanceData.notes}
                onChange={(e) => setMaintenanceData({ ...maintenanceData, notes: e.target.value })}
                placeholder="Any additional information or special instructions..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Summary */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Maintenance Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Type:</span>
                  <span className="font-bold ml-2">{maintenanceTypes.find(t => t.value === maintenanceData.type)?.label}</span>
                </div>
                <div>
                  <span className="text-orange-700">Priority:</span>
                  <span className={`font-bold ml-2 ${priorities.find(p => p.value === maintenanceData.priority)?.color}`}>
                    {priorities.find(p => p.value === maintenanceData.priority)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-orange-700">Scheduled:</span>
                  <span className="font-bold ml-2">{new Date(maintenanceData.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-orange-700">Duration:</span>
                  <span className="font-bold ml-2">{maintenanceData.estimatedDuration} hours</span>
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
            onClick={handleSubmit}
            disabled={saving || !maintenanceData.title.trim()}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Scheduling...' : 'Schedule Maintenance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMaintenanceModal;