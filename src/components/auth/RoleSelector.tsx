import React from 'react';
import { Building, Users, Home } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  className?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange, className = '' }) => {
  const roles = [
    {
      value: 'Landlord',
      label: 'Property Owner / Landlord',
      description: 'I own properties and rent them to tenants',
      features: 'Full property management access',
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      value: 'Agent',
      label: 'Property Manager / Agent',
      description: 'I manage properties on behalf of landlords',
      features: 'Property management with permissions',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      value: 'Tenant',
      label: 'Tenant / Renter',
      description: 'I rent a property and need tenant portal access',
      features: 'Tenant portal and payment access',
      icon: Home,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-text-secondary mb-3">
        Select Your Role <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onRoleChange(role.value)}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                selectedRole === role.value
                  ? 'border-brand-blue bg-brand-blue/5'
                  : 'border-app-border hover:border-brand-blue/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary text-base">{role.label}</h3>
                  <p className="text-sm text-text-secondary mb-1">{role.description}</p>
                  <p className="text-xs text-brand-blue font-medium">{role.features}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedRole === role.value
                    ? 'bg-brand-blue border-brand-blue'
                    : 'border-app-border'
                }`}>
                  {selectedRole === role.value && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;