import React from 'react';
import { AlertTriangle, Archive, ArchiveRestore, Calendar, CheckSquare, Eye, EyeOff, Square, Users } from 'lucide-react';

interface FilterTab {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  count?: number;
}

interface Phase3TabFiltersProps {
  tabs: FilterTab[];
  onTabClick: (key: string) => void;
  className?: string;
}

const Phase3TabFilters: React.FC<Phase3TabFiltersProps> = ({
  tabs,
  onTabClick,
  className = ''
}) => {
  return (
    <div className={`phase3-mobile-tabs ${className}`}>
      <div className="phase3-mobile-tabs-container">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabClick(tab.key)}
              className={tab.active ? 'phase3-mobile-tab-active' : 'phase3-mobile-tab-inactive'}
            >
              <IconComponent size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Predefined filter sets for different sections
export const getPropertyFilterTabs = (
  showVacant: boolean,
  showArchived: boolean,
  showBulkMode: boolean,
  vacantCount: number,
  archivedCount: number
): FilterTab[] => [
  {
    key: 'all',
    label: 'All',
    icon: Eye,
    active: !showVacant && !showArchived && !showBulkMode
  },
  {
    key: 'vacant',
    label: 'Vacant',
    icon: EyeOff,
    active: showVacant,
    count: vacantCount
  },
  {
    key: 'archived',
    label: 'Archived',
    icon: Archive,
    active: showArchived,
    count: archivedCount
  },
  {
    key: 'bulk',
    label: 'Bulk Select',
    icon: showBulkMode ? CheckSquare : Square,
    active: showBulkMode
  }
];

export const getTenantFilterTabs = (
  showLateOnly: boolean,
  showExpiringLeases: boolean,
  showArchived: boolean,
  showBulkMode: boolean,
  lateCount: number,
  expiringCount: number,
  archivedCount: number
): FilterTab[] => [
  {
    key: 'all',
    label: 'All',
    icon: Users,
    active: !showLateOnly && !showExpiringLeases && !showArchived && !showBulkMode
  },
  {
    key: 'late',
    label: 'Late',
    icon: AlertTriangle,
    active: showLateOnly,
    count: lateCount
  },
  {
    key: 'expiring',
    label: 'Expiring',
    icon: Calendar,
    active: showExpiringLeases,
    count: expiringCount
  },
  {
    key: 'archived',
    label: 'Archived',
    icon: Archive,
    active: showArchived,
    count: archivedCount
  },
  {
    key: 'bulk',
    label: 'Bulk Select',
    icon: showBulkMode ? CheckSquare : Square,
    active: showBulkMode
  }
];

export default Phase3TabFilters;