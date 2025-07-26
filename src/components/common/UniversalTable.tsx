// Universal Table component for displaying data in a structured format
import React, { useState } from 'react';

interface Column {
  header: string;
  accessor: string;
  cell?: (row: any) => React.ReactNode;
}

interface PaginationOptions {
  pageSize: number;
  showPageSizeOptions?: boolean;
}

interface RowAction {
  label: string;
  icon: React.ComponentType<any>;
  onClick: (row: any) => void;
}

interface UniversalTableProps {
  data: any[];
  columns: Column[];
  pagination?: PaginationOptions;
  rowActions?: RowAction[];
  tableClassName?: string;
}

const UniversalTable: React.FC<UniversalTableProps> = ({ 
  data, 
  columns, 
  pagination = { pageSize: 10 },
  rowActions = [],
  tableClassName = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize);
  const [showActions, setShowActions] = useState<number | null>(null);
  
  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  const getValue = (row: any, accessor: string) => {
    // Handle nested properties like 'user.name'
    return accessor.split('.').reduce((obj, key) => obj?.[key], row);
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse ${tableClassName}`}>
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className="px-4 py-3 text-left text-sm font-medium text-white"
                >
                  {column.header}
                </th>
              ))}
              {rowActions.length > 0 && (
                <th className="px-4 py-3 text-right text-sm font-medium text-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-4 text-sm text-white/80">
                      {column.cell ? column.cell(row) : getValue(row, column.accessor)}
                    </td>
                  ))}
                  {rowActions.length > 0 && (
                    <td className="px-4 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === rowIndex ? null : rowIndex)}
                          className="p-2 rounded-full hover:bg-white/10 text-white/70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </button>
                        {showActions === rowIndex && (
                          <div className="absolute right-0 mt-2 w-48 bg-black/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 z-10">
                            {rowActions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={() => {
                                  action.onClick(row);
                                  setShowActions(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 first:rounded-t-xl last:rounded-b-xl"
                              >
                                <action.icon size={16} className="mr-2" />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)} 
                  className="px-4 py-8 text-center text-white/70"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <div className="flex items-center">
            {pagination.showPageSizeOptions && (
              <div className="flex items-center text-sm text-white/70">
                <span className="mr-2">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border border-white/20 rounded-md px-2 py-1 bg-black/30 text-white"
                >
                  {[10, 25, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-white/20 text-white disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <span className="text-sm text-white/70">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-white/20 text-white disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalTable;