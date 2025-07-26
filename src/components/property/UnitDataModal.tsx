import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, DollarSign, Receipt, Wrench, Bell, User } from 'lucide-react';
import apiClient from '@/lib/api';

interface UnitDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  unitNumber: string;
  unitName?: string;
}

const UnitDataModal: React.FC<UnitDataModalProps> = ({ 
  isOpen, 
  onClose, 
  propertyId, 
  unitNumber, 
  unitName 
}) => {
  const { data: unitData, isLoading } = useQuery({
    queryKey: ['unitData', propertyId, unitNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}/units/${unitNumber}/data`);
      return data.data;
    },
    enabled: isOpen
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Unit {unitNumber} Data
            </h2>
            <p className="text-text-secondary">
              {unitName || `Unit ${unitNumber}`} - Comprehensive Data View
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
              <span className="ml-3 text-text-secondary">Loading unit data...</span>
            </div>
          ) : unitData ? (
            <div className="space-y-8">
              {/* Tenant Info */}
              <div className="app-surface rounded-3xl p-6 border border-app-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Tenant Information</h3>
                    <p className="text-text-secondary">Current occupant details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Name</p>
                    <p className="font-semibold text-text-primary">{unitData.tenant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Email</p>
                    <p className="font-semibold text-text-primary">{unitData.tenant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Monthly Rent</p>
                    <p className="font-semibold text-green-600">${unitData.tenant.rentAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      unitData.tenant.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : unitData.tenant.status === 'Late'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {unitData.tenant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payments */}
                <div className="app-surface rounded-3xl p-6 border border-app-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Payments ({unitData.payments.length})</h3>
                      <p className="text-sm text-text-secondary">Payment history</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {unitData.payments.map((payment: any) => (
                      <div key={payment._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{payment.rentMonth || 'Payment'}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${payment.amount}</p>
                          <p className={`text-xs ${payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {payment.status}
                          </p>
                        </div>
                      </div>
                    ))}
                    {unitData.payments.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No payments recorded</p>
                    )}
                  </div>
                </div>

                {/* Receipts */}
                <div className="app-surface rounded-3xl p-6 border border-app-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Receipt size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Receipts ({unitData.receipts.length})</h3>
                      <p className="text-sm text-text-secondary">Payment receipts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {unitData.receipts.map((receipt: any) => (
                      <div key={receipt._id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">#{receipt.receiptNumber}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(receipt.paymentDate).toLocaleDateString()} • {receipt.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">${receipt.amount}</p>
                        </div>
                      </div>
                    ))}
                    {unitData.receipts.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No receipts generated</p>
                    )}
                  </div>
                </div>

                {/* Maintenance */}
                <div className="app-surface rounded-3xl p-6 border border-app-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <Wrench size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Maintenance ({unitData.maintenance.length})</h3>
                      <p className="text-sm text-text-secondary">Maintenance requests</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {unitData.maintenance.map((maintenance: any) => (
                      <div key={maintenance._id} className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{maintenance.description}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            maintenance.status === 'Open' ? 'bg-red-100 text-red-800' :
                            maintenance.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {maintenance.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-600">{maintenance.priority} Priority</p>
                          <p className="text-xs text-gray-600">
                            {new Date(maintenance.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {maintenance.assignedTo && (
                          <p className="text-xs text-gray-600 mt-1">
                            Assigned to: {maintenance.assignedTo.name}
                          </p>
                        )}
                      </div>
                    ))}
                    {unitData.maintenance.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No maintenance requests</p>
                    )}
                  </div>
                </div>

                {/* Reminders */}
                <div className="app-surface rounded-3xl p-6 border border-app-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Bell size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Reminders ({unitData.reminders.length})</h3>
                      <p className="text-sm text-text-secondary">Active reminders</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {unitData.reminders.map((reminder: any) => (
                      <div key={reminder._id} className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{reminder.title}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reminder.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reminder.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-600 capitalize">
                            {reminder.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-600">
                            Next: {new Date(reminder.nextRunDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {unitData.reminders.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No active reminders</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Expenses (Shared) */}
              <div className="app-surface rounded-3xl p-6 border border-app-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Property Expenses ({unitData.expenses.length})</h3>
                    <p className="text-sm text-text-secondary">Shared property expenses</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unitData.expenses.map((expense: any) => (
                    <div key={expense._id} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">{expense.description}</p>
                        <p className="font-semibold text-red-600">${expense.amount}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">{expense.category}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {unitData.expenses.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 col-span-full">No property expenses</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">Unit data not available</p>
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDataModal;