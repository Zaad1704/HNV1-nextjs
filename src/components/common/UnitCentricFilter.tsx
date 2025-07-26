import React from 'react';
import { Home, Filter } from 'lucide-react';

interface UnitCentricFilterProps {
  propertyId?: string;
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  units: Array<{
    number: string;
    displayName: string;
    tenant?: string;
    isOccupied: boolean;
  }>;
  showAllOption?: boolean;
  className?: string;
}

const UnitCentricFilter: React.FC<UnitCentricFilterProps> = ({
  propertyId,
  selectedUnit,
  onUnitChange,
  units,
  showAllOption = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Home size={16} />
        <span>Filter by Unit:</span>
      </div>
      
      <select
        value={selectedUnit}
        onChange={(e) => onUnitChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {showAllOption && <option value="">All Units</option>}
        {units.map(unit => (
          <option key={unit.number} value={unit.number}>
            {unit.displayName} {unit.tenant ? `(${unit.tenant})` : '(Vacant)'}
          </option>
        ))}
      </select>
      
      {selectedUnit && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          <Filter size={12} />
          Unit {selectedUnit}
        </div>
      )}
    </div>
  );
};

export default UnitCentricFilter;