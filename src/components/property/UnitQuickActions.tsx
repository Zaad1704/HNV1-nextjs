import React, { useState } from 'react';
import { Edit3, Plus, Eye, UserPlus, Wrench, FileText, MoreHorizontal } from 'lucide-react';

interface Unit {
  _id: string;
  unitNumber: string;
  nickname?: string;
  alternativeName?: string;
  status: string;
  tenantId?: any;
  displayName: string;
}

interface UnitQuickActionsProps {
  unit: Unit;
  propertyId: string;
  onAddTenant: (unitNumber: string) => void;
  onViewTenant: (tenantId: string) => void;
  onEditNickname: () => void;
  onReportMaintenance: (unitId: string) => void;
  className?: string;
}

const UnitQuickActions: React.FC<UnitQuickActionsProps> = ({
  unit,
  propertyId,
  onAddTenant,
  onViewTenant,
  onEditNickname,
  onReportMaintenance,
  className = ""
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const actions = [
    {
      icon: Edit3,
      label: 'Edit Nickname',
      onClick: onEditNickname,
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      icon: unit.tenantId ? Eye : Plus,
      label: unit.tenantId ? 'View Tenant' : 'Add Tenant',
      onClick: () => unit.tenantId ? onViewTenant(unit.tenantId._id) : onAddTenant(unit.unitNumber),
      color: unit.tenantId ? 'text-blue-600 hover:bg-blue-50' : 'text-green-600 hover:bg-green-50'
    },
    {
      icon: Wrench,
      label: 'Report Maintenance',
      onClick: () => onReportMaintenance(unit._id),
      color: 'text-orange-600 hover:bg-orange-50'
    },
    {
      icon: FileText,
      label: 'Unit Details',
      onClick: () => window.open(`/dashboard/properties/${propertyId}/units/${unit._id}`, '_blank'),
      color: 'text-gray-600 hover:bg-gray-50'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Unit Actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Unit {unit.displayName}
              </div>
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    setShowDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${action.color}`}
                >
                  <action.icon size={16} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UnitQuickActions;