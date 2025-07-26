'use client';
import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Download, Search, Filter, Users, BarChart3, MessageCircle, FileText } from 'lucide-react';

interface FloatingTenantActionMenuProps {
  onAddTenant: () => void;
  onQuickPayment: () => void;
  onCollectionSheet: () => void;
  onExport: () => void;
  onSearch: () => void;
  onMessage: () => void;
}

const FloatingTenantActionMenu: React.FC<FloatingTenantActionMenuProps> = ({
  onAddTenant,
  onQuickPayment,
  onCollectionSheet,
  onExport,
  onSearch,
  onMessage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { id: 'add', icon: Plus, label: 'Add Tenant', color: 'bg-blue-500', onClick: onAddTenant },
    { id: 'payment', icon: DollarSign, label: 'Quick Payment', color: 'bg-green-500', onClick: onQuickPayment },
    { id: 'collection', icon: FileText, label: 'Collection Sheet', color: 'bg-purple-500', onClick: onCollectionSheet },
    { id: 'export', icon: Download, label: 'Export Data', color: 'bg-cyan-500', onClick: onExport },
    { id: 'search', icon: Search, label: 'Advanced Search', color: 'bg-pink-500', onClick: onSearch },
    { id: 'message', icon: MessageCircle, label: 'Message Tenants', color: 'bg-indigo-500', onClick: onMessage }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-16 h-16 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
      >
        <Users size={24} />
      </button>
    </div>
  );
};

export default FloatingTenantActionMenu;