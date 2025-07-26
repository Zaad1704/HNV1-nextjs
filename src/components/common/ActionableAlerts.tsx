import React from 'react';
import { Bell, AlertCircle } from 'lucide-react';

// Define the shape of the props for type safety
interface ActionableAlertsProps {
  title: string;
  icon?: React.ReactNode;
  isLoading: boolean;
  items: {
    id: string;
    primaryText: string;
    secondaryText: string;
  }[];
  onActionClick: (id: string) => void;
  actionText: string;
}

const ActionableAlerts: React.FC<ActionableAlertsProps> = ({
  title,
  icon,
  isLoading,
  items,
  onActionClick,
  actionText
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        {icon || <AlertCircle className="mr-2" />}
        {title}
      </h2>
      
      {isLoading ? (
        <div className="text-center text-slate-400 py-4">Loading alerts...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-400 py-4">
            <Bell size={24} className="mx-auto mb-2" />
            No alerts at this time.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(item => (
            <li key={item.id} className="p-3 bg-slate-900/70 rounded-lg border border-slate-700 flex justify-between items-center gap-4">
              <div>
                <p className="font-semibold text-white">{item.primaryText}</p>
                <p className="text-sm text-slate-400">{item.secondaryText}</p>
              </div>
              <button
                onClick={() => onActionClick(item.id)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-bold text-slate-900 bg-yellow-500 rounded-md hover:bg-yellow-400 transition-colors"
              >
                {actionText}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActionableAlerts;
