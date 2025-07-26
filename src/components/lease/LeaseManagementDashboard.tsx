import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, RefreshCw, FileText, Settings, TrendingUp } from 'lucide-react';
import apiClient from '@/lib/api';

interface LeaseAnalytics {
  totalLeases: number;
  activeLeases: number;
  expiringLeases: number;
  autoRenewalLeases: number;
  avgRentAmount: number;
}

interface ExpiringLease {
  _id: string;
  tenantId: any;
  propertyId: any;
  unitId: any;
  endDate: string;
  rentAmount: number;
  autoRenewal: {
    enabled: boolean;
  };
}

const LeaseManagementDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<LeaseAnalytics | null>(null);
  const [expiringLeases, setExpiringLeases] = useState<ExpiringLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeases, setSelectedLeases] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, expiringRes] = await Promise.all([
        apiClient.get('/advanced-lease/analytics'),
        apiClient.get('/advanced-lease/expiring?days=30')
      ]);
      
      setAnalytics(analyticsRes.data.data);
      setExpiringLeases(expiringRes.data.data);
    } catch (error) {
      console.error('Failed to fetch lease data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRenewal = async () => {
    if (selectedLeases.size === 0) return;
    
    try {
      await apiClient.post('/advanced-lease/bulk-renew', {
        leaseIds: Array.from(selectedLeases),
        renewalPeriod: 12,
        rentIncrease: { type: 'percentage', value: 5 }
      });
      
      alert('Leases renewed successfully!');
      fetchData();
      setSelectedLeases(new Set());
    } catch (error) {
      alert('Failed to renew leases');
    }
  };

  const handleAutoRenewal = async () => {
    try {
      await apiClient.post('/advanced-lease/auto-renew');
      alert('Auto-renewals processed successfully!');
      fetchData();
    } catch (error) {
      alert('Failed to process auto-renewals');
    }
  };

  const toggleLeaseSelection = (leaseId: string) => {
    const newSelected = new Set(selectedLeases);
    if (newSelected.has(leaseId)) {
      newSelected.delete(leaseId);
    } else {
      newSelected.add(leaseId);
    }
    setSelectedLeases(newSelected);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading lease management dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lease Management</h1>
        <div className="flex gap-3">
          <button
            onClick={handleAutoRenewal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Process Auto-Renewals
          </button>
          <button
            onClick={handleBulkRenewal}
            disabled={selectedLeases.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FileText size={16} />
            Bulk Renew ({selectedLeases.size})
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Leases</p>
                <p className="text-2xl font-bold">{analytics.totalLeases}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Calendar className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Active Leases</p>
                <p className="text-2xl font-bold">{analytics.activeLeases}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold">{analytics.expiringLeases}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Auto-Renewal</p>
                <p className="text-2xl font-bold">{analytics.autoRenewalLeases}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-indigo-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Avg Rent</p>
                <p className="text-2xl font-bold">${Math.round(analytics.avgRentAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expiring Leases Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Expiring Leases (Next 30 Days)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeases(new Set(expiringLeases.map(l => l._id)));
                      } else {
                        setSelectedLeases(new Set());
                      }
                    }}
                    checked={selectedLeases.size === expiringLeases.length && expiringLeases.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-Renewal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expiringLeases.map((lease) => (
                <tr key={lease._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeases.has(lease._id)}
                      onChange={() => toggleLeaseSelection(lease._id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{lease.tenantId?.name}</div>
                    <div className="text-sm text-gray-500">{lease.tenantId?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{lease.propertyId?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      Unit {lease.unitId?.unitNumber}
                      {lease.unitId?.nickname && (
                        <span className="text-gray-500"> ({lease.unitId.nickname})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {new Date(lease.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.ceil((new Date(lease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">${lease.rentAmount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lease.autoRenewal.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {lease.autoRenewal.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Renew
                      </button>
                      <button className="text-purple-600 hover:text-purple-800 text-sm">
                        Settings
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaseManagementDashboard;