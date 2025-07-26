'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Upload, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminDataManagementPage = () => {
  const [activeTab, setActiveTab] = useState('backup');
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'export', label: 'Data Export', icon: Download },
    { id: 'import', label: 'Data Import', icon: Upload },
    { id: 'cleanup', label: 'Data Cleanup', icon: Trash2 }
  ];

  const backupHistory = [
    { id: '1', date: '2024-01-15 10:30', size: '2.4 GB', status: 'completed', type: 'full' },
    { id: '2', date: '2024-01-14 10:30', size: '2.3 GB', status: 'completed', type: 'full' },
    { id: '3', date: '2024-01-13 10:30', size: '2.2 GB', status: 'completed', type: 'full' }
  ];

  const handleBackup = async () => {
    setIsProcessing(true);
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
    alert('Backup completed successfully!');
  };

  const handleExport = async (type: string) => {
    setIsProcessing(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    alert(`${type} export completed!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Data Management</h1>
        <p className="text-text-secondary mt-1">Manage system data, backups, and exports</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-app-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Backup & Restore Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="app-surface rounded-2xl p-6 border border-app-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Create Backup</h3>
              <p className="text-text-secondary mb-6">Create a full system backup including all data</p>
              <button
                onClick={handleBackup}
                disabled={isProcessing}
                className="w-full btn-gradient py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Database size={20} />
                )}
                {isProcessing ? 'Creating Backup...' : 'Create Full Backup'}
              </button>
            </div>

            <div className="app-surface rounded-2xl p-6 border border-app-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Database Size</span>
                  <span className="font-semibold text-text-primary">2.4 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Last Backup</span>
                  <span className="font-semibold text-text-primary">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="font-semibold text-green-600">Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="app-surface rounded-2xl p-6 border border-app-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Backup History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-app-border">
                  <tr>
                    <th className="text-left py-3 font-semibold text-text-secondary">Date</th>
                    <th className="text-left py-3 font-semibold text-text-secondary">Type</th>
                    <th className="text-left py-3 font-semibold text-text-secondary">Size</th>
                    <th className="text-left py-3 font-semibold text-text-secondary">Status</th>
                    <th className="text-left py-3 font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {backupHistory.map((backup) => (
                    <tr key={backup.id}>
                      <td className="py-3 text-text-primary">{backup.date}</td>
                      <td className="py-3 text-text-primary capitalize">{backup.type}</td>
                      <td className="py-3 text-text-primary">{backup.size}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {backup.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Data Export Tab */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { type: 'Users', description: 'Export all user data', icon: '👥' },
            { type: 'Organizations', description: 'Export organization data', icon: '🏢' },
            { type: 'Properties', description: 'Export property data', icon: '🏠' },
            { type: 'Tenants', description: 'Export tenant data', icon: '👤' },
            { type: 'Payments', description: 'Export payment records', icon: '💳' },
            { type: 'Analytics', description: 'Export analytics data', icon: '📊' }
          ].map((item) => (
            <div key={item.type} className="app-surface rounded-2xl p-6 border border-app-border">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{item.type}</h3>
              <p className="text-text-secondary mb-4">{item.description}</p>
              <button
                onClick={() => handleExport(item.type)}
                disabled={isProcessing}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Data Import Tab */}
      {activeTab === 'import' && (
        <div className="app-surface rounded-2xl p-8 border border-app-border text-center">
          <Upload size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">Import Data</h3>
          <p className="text-text-secondary mb-6">Upload CSV or JSON files to import data</p>
          <div className="border-2 border-dashed border-app-border rounded-xl p-8">
            <input type="file" className="hidden" id="file-upload" accept=".csv,.json" />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload size={32} className="text-text-muted" />
              <div>
                <p className="font-medium text-text-primary">Click to upload files</p>
                <p className="text-sm text-text-secondary">CSV or JSON files up to 10MB</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Data Cleanup Tab */}
      {activeTab === 'cleanup' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Data Cleanup Tools</h3>
            </div>
            <p className="text-yellow-700">
              Use these tools carefully. Data cleanup operations cannot be undone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Remove Inactive Users', description: 'Delete users inactive for 6+ months', danger: false },
              { title: 'Clean Audit Logs', description: 'Remove audit logs older than 1 year', danger: false },
              { title: 'Delete Test Data', description: 'Remove all test organizations and data', danger: true },
              { title: 'Purge Deleted Items', description: 'Permanently remove soft-deleted items', danger: true }
            ].map((item, index) => (
              <div key={index} className="app-surface rounded-2xl p-6 border border-app-border">
                <h4 className="font-semibold text-text-primary mb-2">{item.title}</h4>
                <p className="text-text-secondary mb-4">{item.description}</p>
                <button
                  className={`w-full py-2 rounded-xl font-medium transition-colors ${
                    item.danger
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {item.danger ? 'Danger Zone' : 'Clean Up'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDataManagementPage;