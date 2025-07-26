import React, { useState } from 'react';
import { X, RefreshCw, XCircle, FileText, Calendar } from 'lucide-react';
import apiClient from '@/lib/api';

interface BulkLeaseOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeases: string[];
  onSuccess: () => void;
}

type OperationType = 'renew' | 'terminate' | 'generate_docs';

const BulkLeaseOperationsModal: React.FC<BulkLeaseOperationsModalProps> = ({
  isOpen,
  onClose,
  selectedLeases,
  onSuccess
}) => {
  const [operation, setOperation] = useState<OperationType>('renew');
  const [renewalPeriod, setRenewalPeriod] = useState(12);
  const [rentIncrease, setRentIncrease] = useState({ type: 'percentage', value: 0 });
  const [terminationDate, setTerminationDate] = useState('');
  const [terminationReason, setTerminationReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleBulkRenewal = async () => {
    setProcessing(true);
    try {
      await apiClient.post('/advanced-lease/bulk-renew', {
        leaseIds: selectedLeases,
        renewalPeriod,
        rentIncrease: rentIncrease.value > 0 ? rentIncrease : null
      });
      alert(`${selectedLeases.length} leases renewed successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to renew leases');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkTermination = async () => {
    if (!terminationDate) {
      alert('Please select a termination date');
      return;
    }
    
    setProcessing(true);
    try {
      await apiClient.post('/advanced-lease/bulk-terminate', {
        leaseIds: selectedLeases,
        terminationDate,
        reason: terminationReason
      });
      alert(`${selectedLeases.length} leases terminated successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to terminate leases');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDocumentGeneration = async () => {
    setProcessing(true);
    try {
      const promises = selectedLeases.map(leaseId =>
        apiClient.post('/advanced-lease/generate-document', { leaseId })
      );
      await Promise.all(promises);
      alert(`Documents generated for ${selectedLeases.length} leases!`);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to generate documents');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = () => {
    switch (operation) {
      case 'renew':
        handleBulkRenewal();
        break;
      case 'terminate':
        handleBulkTermination();
        break;
      case 'generate_docs':
        handleBulkDocumentGeneration();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Lease Operations</h2>
              <p className="text-sm text-gray-600">{selectedLeases.length} leases selected</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Operation Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Operation
            </label>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="operation"
                  value="renew"
                  checked={operation === 'renew'}
                  onChange={(e) => setOperation(e.target.value as OperationType)}
                  className="mr-3"
                />
                <RefreshCw size={20} className="text-green-600 mr-3" />
                <div>
                  <div className="font-medium">Bulk Renewal</div>
                  <div className="text-sm text-gray-500">Extend lease terms for selected leases</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="operation"
                  value="terminate"
                  checked={operation === 'terminate'}
                  onChange={(e) => setOperation(e.target.value as OperationType)}
                  className="mr-3"
                />
                <XCircle size={20} className="text-red-600 mr-3" />
                <div>
                  <div className="font-medium">Bulk Termination</div>
                  <div className="text-sm text-gray-500">Terminate selected leases</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="operation"
                  value="generate_docs"
                  checked={operation === 'generate_docs'}
                  onChange={(e) => setOperation(e.target.value as OperationType)}
                  className="mr-3"
                />
                <FileText size={20} className="text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Generate Documents</div>
                  <div className="text-sm text-gray-500">Create lease documents for selected leases</div>
                </div>
              </label>
            </div>
          </div>

          {/* Operation-specific fields */}
          {operation === 'renew' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renewal Period (months)
                </label>
                <select
                  value={renewalPeriod}
                  onChange={(e) => setRenewalPeriod(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={24}>24 months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Increase (optional)
                </label>
                <div className="flex gap-3">
                  <select
                    value={rentIncrease.type}
                    onChange={(e) => setRentIncrease({ ...rentIncrease, type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                  <input
                    type="number"
                    value={rentIncrease.value}
                    onChange={(e) => setRentIncrease({ ...rentIncrease, value: Number(e.target.value) })}
                    placeholder={rentIncrease.type === 'percentage' ? '5' : '100'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {operation === 'terminate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Termination Date
                </label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Termination
                </label>
                <textarea
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  placeholder="Enter reason for termination..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {operation === 'renew' && <RefreshCw size={16} />}
                {operation === 'terminate' && <XCircle size={16} />}
                {operation === 'generate_docs' && <FileText size={16} />}
                Execute Operation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkLeaseOperationsModal;