import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

const DataIntegrityChecker: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const { data: validation, refetch } = useQuery({
    queryKey: ['dataValidation'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties/validate/data-integrity');
      return data.data;
    }
  });

  const handleFix = async () => {
    setIsFixing(true);
    try {
      await apiClient.get('/properties/validate/data-integrity?fix=true');
      await refetch();
      alert('Data inconsistencies fixed successfully!');
    } catch (error) {
      alert('Failed to fix data inconsistencies');
    } finally {
      setIsFixing(false);
    }
  };

  if (!validation) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {validation.valid ? (
            <CheckCircle size={24} className="text-green-600" />
          ) : (
            <AlertTriangle size={24} className="text-orange-600" />
          )}
          <div>
            <h3 className="font-semibold text-text-primary">Data Integrity Status</h3>
            <p className="text-sm text-text-secondary">
              {validation.valid ? 'All data connections are valid' : `${validation.issues.length} issues found`}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
          
          {!validation.valid && (
            <button
              onClick={handleFix}
              disabled={isFixing}
              className="px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Wrench size={16} />
              {isFixing ? 'Fixing...' : 'Auto Fix'}
            </button>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{validation.summary.totalProperties}</p>
              <p className="text-sm text-gray-600">Properties</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{validation.summary.totalTenants}</p>
              <p className="text-sm text-gray-600">Tenants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{validation.summary.issuesFound}</p>
              <p className="text-sm text-gray-600">Issues</p>
            </div>
          </div>

          {validation.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary">Issues Found:</h4>
              {validation.issues.map((issue: any, index: number) => (
                <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-orange-600" />
                    <span className="font-medium text-orange-800 capitalize">
                      {issue.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    {issue.type === 'orphaned_tenant' && `Tenant "${issue.tenantName}" references non-existent property`}
                    {issue.type === 'unit_overflow' && `Property "${issue.propertyName}" has ${issue.currentTenants} tenants but only ${issue.maxUnits} units`}
                    {issue.type === 'duplicate_units' && `Property "${issue.propertyName}" has duplicate unit assignments: ${issue.duplicateUnits.join(', ')}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataIntegrityChecker;