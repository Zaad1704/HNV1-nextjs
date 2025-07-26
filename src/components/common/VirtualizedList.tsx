import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 5
}: VirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Specialized components
export const VirtualizedPropertyList: React.FC<{
  properties: any[];
  onPropertyClick: (property: any) => void;
  height?: number;
}> = ({ properties, onPropertyClick, height = 400 }) => {
  return (
    <VirtualizedList
      items={properties}
      height={height}
      itemHeight={120}
      className="border rounded-lg"
      renderItem={(property, index) => (
        <div
          key={property.id}
          className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onPropertyClick(property)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {property.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {property.address?.formattedAddress}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  {property.numberOfUnits} units
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  property.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export const VirtualizedTenantList: React.FC<{
  tenants: any[];
  onTenantClick: (tenant: any) => void;
  height?: number;
}> = ({ tenants, onTenantClick, height = 400 }) => {
  return (
    <VirtualizedList
      items={tenants}
      height={height}
      itemHeight={80}
      className="border rounded-lg"
      renderItem={(tenant, index) => (
        <div
          key={tenant.id}
          className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onTenantClick(tenant)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {tenant.name}
              </h4>
              <p className="text-sm text-gray-500 truncate">
                {tenant.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                ${tenant.rentAmount}
              </p>
              <p className={`text-xs ${
                tenant.status === 'active' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {tenant.status}
              </p>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default VirtualizedList;