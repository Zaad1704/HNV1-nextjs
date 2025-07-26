import React from 'react';
import { Download, DollarSign, Filter, Plus } from 'lucide-react';

interface Phase3MobileHeaderProps {
  title: string;
  count: number;
  stats: Array<{
    label: string;
    value: number | string;
    color: string;
  }>;
  onExport?: () => void;
  onQuickAction?: () => void;
  onFilter?: () => void;
  onAdd?: () => void;
  showFilters?: boolean;
  activeFiltersCount?: number;
}

const Phase3MobileHeader: React.FC<Phase3MobileHeaderProps> = ({
  title,
  count,
  stats,
  onExport,
  onQuickAction,
  onFilter,
  onAdd,
  showFilters = false,
  activeFiltersCount = 0
}) => {
  return (
    <div className="phase3-mobile-header">
      <div className="phase3-mobile-header-content">
        <div className="phase3-mobile-header-title">
          <h1>{title} ({count})</h1>
          <div className="subtitle flex items-center gap-3">
            {stats.slice(0, 2).map((stat, index) => (
              <span key={index} className="flex items-center gap-1 text-white/80">
                <div className={`w-2 h-2 rounded-full bg-${stat.color}-400`}></div>
                {stat.value} {stat.label}
              </span>
            ))}
          </div>
        </div>
        
        <div className="phase3-mobile-header-actions">
          {onFilter && (
            <button
              onClick={onFilter}
              className={`phase3-mobile-header-btn relative ${
                showFilters ? 'bg-blue-500 text-white' : ''
              }`}
            >
              <Filter size={16} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
          
          {onQuickAction && (
            <button onClick={onQuickAction} className="phase3-mobile-header-btn bg-green-500 text-white">
              <DollarSign size={16} />
            </button>
          )}
          
          {onExport && (
            <button onClick={onExport} className="phase3-mobile-header-btn bg-blue-500 text-white">
              <Download size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Phase3MobileHeader;