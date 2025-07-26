import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'dateRange';
  options?: { value: string; label: string }[];
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  filters: any;
  placeholder?: string;
  filterOptions: FilterOption[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  filters,
  placeholder = "Search...",
  filterOptions
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <div className="flex gap-2">
        {filterOptions.map((option) => {
          if (option.type === 'dateRange') {
            return (
              <div key={option.key} className="flex gap-2">
                <input
                  type="date"
                  placeholder={t('common.start_date')}
                  onChange={(e) => onFilter({ 
                    ...filters, 
                    [option.key]: { 
                      ...filters[option.key], 
                      start: e.target.value 
                    } 
                  })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="date"
                  placeholder={t('common.end_date')}
                  onChange={(e) => onFilter({ 
                    ...filters, 
                    [option.key]: { 
                      ...filters[option.key], 
                      end: e.target.value 
                    } 
                  })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            );
          }
          
          return (
            <select
              key={option.key}
              value={filters[option.key] || ''}
              onChange={(e) => onFilter({ ...filters, [option.key]: e.target.value || undefined })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{option.label}</option>
              {option.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        })}
      </div>
    </div>
  );
};

export default SearchFilter;