import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, DollarSign, Users, AlertCircle, 
  Download, Phone, Mail, MessageSquare, 
  CheckCircle, Clock, XCircle, FileText,
  Filter, Search, Plus
} from 'lucide-react';
import apiClient from '@/lib/api';

interface RentCollectionDashboardProps {
  year: number;
  month: number;
}

const RentCollectionDashboard: React.FC<RentCollectionDashboardProps> = ({ year, month }) => {
  const queryClient = useQueryClient();
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Fetch collection period data
  const { data: collectionData, isLoading } = useQuery({
    queryKey: ['collectionPeriod', year, month],
    queryFn: async () => {
      const response = await apiClient.get(`/rent-collection/period/${year}/${month}`);
      return response.data.data;
    }
  });

  // Generate collection sheet mutation
  const generateSheetMutation = useMutation({
    mutationFn: async (options: any) => {
      const response = await apiClient.post(`/rent-collection/sheet/${collectionData._id}/create`, options);
      return response.data;
    },
    onSuccess: (data) => {
      // Download the generated sheet
      window.open(data.data.result.fileUrl, '_blank');
    }
  });

  // Record collection action mutation
  const recordActionMutation = useMutation({
    mutationFn: async (actionData: any) => {
      const response = await apiClient.post('/rent-collection/action', actionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionPeriod', year, month] });
      setShowActionModal(false);
      setSelectedTenant(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <span className="ml-3 text-gray-600">Loading collection data...</span>
      </div>
    );
  }

  if (!collectionData) {
    return (
      <div className="text-center py-16">
        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Collection Data</h3>
        <p className="text-gray-600">No rent collection data found for this period.</p>
      </div>
    );
  }

  const { summary, tenants } = collectionData;

  // Filter tenants based on status and search
  const filteredTenants = tenants.filter((tenant: any) => {
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.property.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleGenerateSheet = () => {
    const options = {
      format: {
        type: 'printable',
        layout: 'compact',
        groupBy: 'property'
      },
      sections: {
        header: {
          showLogo: true,
          showPeriod: true,
          showSummary: true,
          customText: `Monthly Rent Collection - ${getMonthName(month)} ${year}`
        },
        tenantList: {
          showCheckboxes: true,
          showContactInfo: true,
          showPaymentHistory: false,
          showNotes: true,
          sortBy: 'property'
        },
        footer: {
          showTotals: true,
          showSignature: true,
          showDate: true
        }
      },
      customization: {
        fieldsToShow: [
          'tenant_name', 'property', 'unit', 'rent_due',
          'late_fees', 'total_owed', 'due_date', 'contact_phone'
        ],
        checkboxStyle: 'square',
        fontSize: 'medium'
      }
    };

    generateSheetMutation.mutate(options);
  };

  const handleRecordAction = (tenant: any, actionType: string) => {
    setSelectedTenant(tenant);
    setShowActionModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rent Collection - {getMonthName(month)} {year}
          </h1>
          <p className="text-gray-600 mt-1">Manage monthly rent collection and track payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateSheet}
            disabled={generateSheetMutation.isPending}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
          >
            <FileText size={16} />
            {generateSheetMutation.isPending ? 'Generating...' : 'Collection Sheet'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalUnits}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-gray-900">${summary.collectedRent.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">${summary.outstandingRent.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summary.collectionRate.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants or properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tenant List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tenant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Property</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount Due</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Days Late</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant: any, index: number) => (
                <motion.tr
                  key={tenant.tenantId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-500">Unit {tenant.unit}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{tenant.property}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">${tenant.totalOwed.toFixed(2)}</p>
                      {tenant.lateFees > 0 && (
                        <p className="text-sm text-red-600">+${tenant.lateFees.toFixed(2)} late fees</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(tenant.status)}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${tenant.daysLate > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {tenant.daysLate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{tenant.contact.phone}</p>
                      <p className="text-gray-500">{tenant.contact.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRecordAction(tenant, 'call')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Record Call"
                      >
                        <Phone size={16} />
                      </button>
                      <button
                        onClick={() => handleRecordAction(tenant, 'email')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Record Email"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        onClick={() => handleRecordAction(tenant, 'visit')}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Record Visit"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collection Action Modal */}
      {showActionModal && selectedTenant && (
        <CollectionActionModal
          tenant={selectedTenant}
          periodId={collectionData._id}
          onClose={() => {
            setShowActionModal(false);
            setSelectedTenant(null);
          }}
          onSave={(actionData) => recordActionMutation.mutate(actionData)}
          isLoading={recordActionMutation.isPending}
        />
      )}
    </div>
  );
};

// Collection Action Modal Component
interface CollectionActionModalProps {
  tenant: any;
  periodId: string;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

const CollectionActionModal: React.FC<CollectionActionModalProps> = ({
  tenant, periodId, onClose, onSave, isLoading
}) => {
  const [actionType, setActionType] = useState('call');
  const [outcome, setOutcome] = useState('contacted');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [promisedAmount, setPromisedAmount] = useState('');
  const [promisedDate, setPromisedDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const actionData = {
      tenantId: tenant.tenantId,
      periodId,
      type: actionType,
      details: {
        outcome,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined
      },
      paymentInfo: outcome === 'promised_payment' ? {
        amountPromised: parseFloat(promisedAmount),
        promisedDate: new Date(promisedDate)
      } : undefined
    };

    onSave(actionData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Record Collection Action</h3>
          <p className="text-sm text-gray-600">{tenant.name} - {tenant.property}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            >
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="visit">In-Person Visit</option>
              <option value="notice">Notice Sent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            >
              <option value="contacted">Successfully Contacted</option>
              <option value="no_answer">No Answer</option>
              <option value="promised_payment">Promised Payment</option>
              <option value="dispute">Payment Dispute</option>
              <option value="payment_plan">Payment Plan Arranged</option>
            </select>
          </div>

          {outcome === 'promised_payment' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promised Amount</label>
                  <input
                    type="number"
                    value={promisedAmount}
                    onChange={(e) => setPromisedAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promised Date</label>
                  <input
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl"
              placeholder="Add notes about this interaction..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date (Optional)</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Recording...' : 'Record Action'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RentCollectionDashboard;