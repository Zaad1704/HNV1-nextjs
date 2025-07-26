import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { X, User, Home, CreditCard, Wrench, ChevronDown, ChevronUp, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TenantDetailsProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

const fetchTenantDetails = async (tenantId: string) => {
  const { data } = await apiClient.get(`/tenants/${tenantId}/details`);
  return data.data;
};

const TenantDetailsModal: React.FC<TenantDetailsProps> = ({ tenantId, isOpen, onClose }) => {
  const { currency } = useCurrency();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    property: false,
    payments: false,
    maintenance: false,
    agent: false
  });

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenantDetails', tenantId],
    queryFn: () => fetchTenantDetails(tenantId),
    enabled: isOpen && !!tenantId
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={24} />
              Tenant Details
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="text-center py-8">Loading tenant details...</div>
          ) : (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    {tenant?.imageUrl && (
                      <img src={tenant.imageUrl} alt={tenant.name} className="w-16 h-16 rounded-full object-cover" />
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{tenant?.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{tenant?.email}</p>
                      <p className="text-gray-600 dark:text-gray-400">{tenant?.phone}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div><span className="font-medium">Father's Name:</span> {tenant?.fatherName || 'N/A'}</div>
                    <div><span className="font-medium">Mother's Name:</span> {tenant?.motherName || 'N/A'}</div>
                    <div><span className="font-medium">Govt ID:</span> {tenant?.govtIdNumber || 'N/A'}</div>
                    <div><span className="font-medium">Address:</span> {tenant?.permanentAddress || 'N/A'}</div>
                  </div>
                </div>
                
                {tenant?.govtIdImages && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Government ID Images:</h5>
                    <div className="flex gap-4">
                      {tenant.govtIdImages.front && (
                        <img src={tenant.govtIdImages.front} alt="ID Front" className="w-32 h-20 object-cover rounded border" />
                      )}
                      {tenant.govtIdImages.back && (
                        <img src={tenant.govtIdImages.back} alt="ID Back" className="w-32 h-20 object-cover rounded border" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Lease Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lease Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="font-medium">Unit:</span> {tenant?.unit}</div>
                  <div><span className="font-medium">Rent Amount:</span> {currency}{tenant?.rentAmount}</div>
                  <div><span className="font-medium">Lease End:</span> {tenant?.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {/* Property Details - Collapsible */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
                <button
                  onClick={() => toggleSection('property')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Home size={20} />
                    Property Details
                  </h3>
                  {expandedSections.property ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSections.property && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Property Name:</span> {tenant?.propertyId?.name}</div>
                      <div><span className="font-medium">Address:</span> {tenant?.propertyId?.address}</div>
                      <div><span className="font-medium">Total Units:</span> {tenant?.propertyId?.numberOfUnits}</div>
                      <div><span className="font-medium">Property Type:</span> {tenant?.propertyId?.type || 'Residential'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment History - Collapsible */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
                <button
                  onClick={() => toggleSection('payments')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment History & Dues
                  </h3>
                  {expandedSections.payments ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSections.payments && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded">
                          <div className="text-sm text-green-600 dark:text-green-400">Total Paid</div>
                          <div className="text-xl font-bold">{currency}{tenant?.paymentSummary?.totalPaid || 0}</div>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded">
                          <div className="text-sm text-red-600 dark:text-red-400">Outstanding</div>
                          <div className="text-xl font-bold">{currency}{tenant?.paymentSummary?.outstanding || 0}</div>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded">
                          <div className="text-sm text-yellow-600 dark:text-yellow-400">Overdue Months</div>
                          <div className="text-xl font-bold">{tenant?.paymentSummary?.overdueMonths || 0}</div>
                        </div>
                      </div>
                      
                      {tenant?.recentPayments && (
                        <div>
                          <h5 className="font-medium mb-2">Recent Payments:</h5>
                          <div className="space-y-2">
                            {tenant.recentPayments.map((payment: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                <span>{new Date(payment.date).toLocaleDateString()}</span>
                                <span className="font-medium">{currency}{payment.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance Requests - Collapsible */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
                <button
                  onClick={() => toggleSection('maintenance')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Wrench size={20} />
                    Maintenance Requests
                  </h3>
                  {expandedSections.maintenance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSections.maintenance && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {tenant?.maintenanceRequests?.length > 0 ? (
                      <div className="space-y-3">
                        {tenant.maintenanceRequests.map((request: any, index: number) => (
                          <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-medium">{request.title}</h6>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{request.description}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                request.status === 'completed' ? 'bg-green-200 text-green-800' :
                                request.status === 'in-progress' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-red-200 text-red-800'
                              }`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No maintenance requests</p>
                    )}
                  </div>
                )}
              </div>

              {/* Agent Information - Collapsible */}
              {tenant?.agentId && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
                  <button
                    onClick={() => toggleSection('agent')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <User size={20} />
                      Managing Agent
                    </h3>
                    {expandedSections.agent ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSections.agent && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><span className="font-medium">Name:</span> {tenant.agentId.name}</div>
                        <div><span className="font-medium">Email:</span> {tenant.agentId.email}</div>
                        <div><span className="font-medium">Phone:</span> {tenant.agentId.phone}</div>
                        <div><span className="font-medium">Properties Managed:</span> {tenant.agentId.propertiesCount || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Adults */}
              {tenant?.additionalAdults?.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Adults</h3>
                  <div className="space-y-3">
                    {tenant.additionalAdults.map((adult: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded">
                        <span className="font-medium">{adult.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{adult.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500">
          Powered by HNV Property Management Solutions
        </div>
      </div>
    </div>
  );
};

export default TenantDetailsModal;