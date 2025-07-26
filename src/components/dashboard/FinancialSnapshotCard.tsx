import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FinancialSnapshotCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const FinancialSnapshotCard: React.FC<FinancialSnapshotCardProps> = ({ 
  title, 
  value, 
  icon: Icon,
  trend 
}) => {
  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-2">{title}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 app-gradient rounded-2xl flex items-center justify-center text-white">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default FinancialSnapshotCard;