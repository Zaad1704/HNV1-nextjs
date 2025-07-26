import React from 'react';
import Link from 'next/link';
import { Users, Plus, DollarSign, FileText, TrendingUp, Archive } from 'lucide-react';

interface PropertyQuickActionsProps {
  propertyId: string;
  property: any;
  tenants: any[];
  onRentIncrease: () => void;
  onCollectionSheet: () => void;
  onArchive: () => void;
}

const PropertyQuickActions: React.FC<PropertyQuickActionsProps> = ({
  propertyId,
  property,
  tenants,
  onRentIncrease,
  onCollectionSheet,
  onArchive
}) => {
  const activeTenants = tenants.filter(t => t.status === 'Active');

  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Link 
          to={`/dashboard/tenants?propertyId=${propertyId}`}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>View Tenants</span>
          </div>
          <span className="bg-blue-400 px-2 py-1 rounded-full text-xs">
            {activeTenants.length}
          </span>
        </Link>

        <button 
          onClick={() => window.location.href = `/dashboard/tenants/add?propertyId=${propertyId}`}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Tenant
        </button>

        <Link 
          to={`/dashboard/payments?propertyId=${propertyId}`}
          className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
        >
          <DollarSign size={16} />
          View Payments
        </Link>

        <button
          onClick={onCollectionSheet}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          <FileText size={16} />
          Collection Sheet
        </button>

        <button
          onClick={onRentIncrease}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <TrendingUp size={16} />
          Increase Rent
        </button>

        <button
          onClick={onArchive}
          className="w-full bg-gray-400 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-500 transition-colors flex items-center gap-2"
        >
          <Archive size={16} />
          Archive Property
        </button>
      </div>
    </div>
  );
};

export default PropertyQuickActions;