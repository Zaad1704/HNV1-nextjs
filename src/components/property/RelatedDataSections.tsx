import React, { useState } from 'react';
import Link from 'next/link';
import { Users, DollarSign, Wrench, TrendingUp, Filter, Eye, Calendar, AlertTriangle } from 'lucide-react';
import TenantAvatar from '@/components/common/TenantAvatar';

interface RelatedDataSectionsProps {
  propertyId: string;
  property: any;
  tenants: any[];
  payments: any[];
  expenses: any[];
  maintenanceRequests: any[];
}

const RelatedDataSections: React.FC<RelatedDataSectionsProps> = ({
  propertyId,
  property,
  tenants,
  payments,
  expenses,
  maintenanceRequests
}) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'payments' | 'maintenance' | 'cashflow'>('tenants');
  const [unitFilter, setUnitFilter] = useState<string>('');

  // Get unit options with nicknames
  const getUnitOptions = () => {
    const units = [];
    for (let i = 1; i <= (property.numberOfUnits || 1); i++) {
      const unitNumber = i.toString();
      const tenant = tenants.find(t => t.unit === unitNumber);
      units.push({
        number: unitNumber,
        displayName: `Unit ${unitNumber}`,
        tenant: tenant?.name,
        isOccupied: !!tenant
      });
    }
    return units;
  };

  // Filter data by unit
  const getFilteredData = () => {
    if (!unitFilter) return { tenants, payments, expenses, maintenanceRequests };
    
    const filteredTenants = tenants.filter(t => t.unit === unitFilter);
    const tenantIds = filteredTenants.map(t => t._id);
    
    return {
      tenants: filteredTenants,
      payments: payments.filter(p => tenantIds.includes(p.tenantId)),
      expenses: expenses, // Expenses are property-wide
      maintenanceRequests: maintenanceRequests.filter(m => 
        tenantIds.includes(m.tenantId) || m.unit === unitFilter
      )
    };
  };

  const filteredData = getFilteredData();

  return (
    <div className="rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3 lg:gap-0">
        <h2 className="text-lg lg:text-xl font-bold text-white">Related Data</h2>
        
        {/* Unit Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white/80" />
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 text-white"
              style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}
            >
              <option value="">All Units</option>
              {getUnitOptions().map(unit => (
                <option key={unit.number} value={unit.number}>
                  {unit.displayName} {unit.tenant ? `(${unit.tenant})` : '(Vacant)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-white/20 mb-4 lg:mb-6 -mx-4 lg:mx-0 px-4 lg:px-0">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-3 lg:px-4 py-2 font-medium text-xs lg:text-sm flex items-center gap-2 whitespace-nowrap touch-manipulation ${
            activeTab === 'tenants' 
              ? 'border-b-2 border-blue-400 text-blue-300' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          <Users size={16} />
          Tenants ({filteredData.tenants.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 lg:px-4 py-2 font-medium text-xs lg:text-sm flex items-center gap-2 whitespace-nowrap touch-manipulation ${
            activeTab === 'payments' 
              ? 'border-b-2 border-blue-400 text-blue-300' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          <DollarSign size={16} />
          Payments ({filteredData.payments.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-3 lg:px-4 py-2 font-medium text-xs lg:text-sm flex items-center gap-2 whitespace-nowrap touch-manipulation ${
            activeTab === 'maintenance' 
              ? 'border-b-2 border-blue-400 text-blue-300' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          <Wrench size={16} />
          Maintenance ({filteredData.maintenanceRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-3 lg:px-4 py-2 font-medium text-xs lg:text-sm flex items-center gap-2 whitespace-nowrap touch-manipulation ${
            activeTab === 'cashflow' 
              ? 'border-b-2 border-blue-400 text-blue-300' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          <TrendingUp size={16} />
          Cash Flow
        </button>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'tenants' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>
                Tenants {unitFilter && `in Unit ${unitFilter}`}
              </h3>
              <Link
                to={`/dashboard/tenants?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
                className="text-blue-300 hover:text-blue-200 text-sm font-bold px-3 py-1 rounded-lg"
                style={{background: 'rgba(0,0,0,0.3)', textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}
              >
                View All
              </Link>
            </div>
            
            {filteredData.tenants.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 lg:gap-4">
                {filteredData.tenants.map((tenant: any) => (
                  <div key={tenant._id} className="border border-white/40 rounded-lg p-3 lg:p-4 hover:border-blue-300 transition-colors touch-manipulation" style={{background: 'rgba(0, 0, 0, 0.2)'}}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TenantAvatar 
                          tenant={tenant} 
                          size="lg" 
                        />
                        <div>
                          <div className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>{tenant.name}</div>
                          <div className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{tenant.unit}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tenant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tenant.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white font-semibold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Rent:</span>
                        <span className="font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>${tenant.rentAmount || 0}/month</span>
                      </div>
                      {tenant.leaseEndDate && (
                        <div className="flex justify-between">
                          <span className="text-white font-semibold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Lease Ends:</span>
                          <span className="font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{new Date(tenant.leaseEndDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/dashboard/tenants/${tenant._id}`}
                      className="mt-3 w-full text-blue-300 py-2 px-3 rounded-lg text-xs lg:text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 touch-manipulation border border-white/20"
                      style={{background: 'rgba(255, 255, 255, 0.05)'}}
                    >
                      <Eye size={14} />
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-6 rounded-2xl border-2" style={{background: 'linear-gradient(135deg, rgba(255,193,7,0.3), rgba(255,152,0,0.2))', border: '2px solid rgba(255,193,7,0.6)', backdropFilter: 'blur(10px)'}}>
                  <AlertTriangle size={32} className="text-yellow-200 mx-auto mb-3 animate-pulse" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                  <p className="text-white font-bold text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>⚠️ No tenants found {unitFilter && `in Unit ${unitFilter}`}</p>
                  <p className="text-yellow-200 text-sm mt-2 font-semibold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Attention Required</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>
                Payments {unitFilter && `for Unit ${unitFilter}`}
              </h3>
              <Link
                to={`/dashboard/payments?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
                className="text-blue-300 hover:text-blue-200 text-sm font-bold px-3 py-1 rounded-lg"
                style={{background: 'rgba(0,0,0,0.3)', textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}
              >
                View All
              </Link>
            </div>
            
            {filteredData.payments.length > 0 ? (
              <div className="space-y-3">
                {filteredData.payments.slice(0, 10).map((payment: any) => {
                  const tenant = tenants.find(t => t._id === payment.tenantId);
                  return (
                    <div key={payment._id} className="flex items-center justify-between p-4 border border-white/20 rounded-lg" style={{background: 'rgba(0, 0, 0, 0.2)'}}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                          <DollarSign size={14} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {tenant?.name || 'Unknown Tenant'} - Unit {tenant?.unit}
                          </div>
                          <div className="text-sm text-white/70">
                            {payment.rentMonth} • {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-300">${payment.amount}</div>
                        <div className={`text-xs ${
                          payment.status === 'Paid' ? 'text-green-300' : 'text-yellow-300'
                        }`}>
                          {payment.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-6 rounded-2xl border-2" style={{background: 'linear-gradient(135deg, rgba(220,38,38,0.4), rgba(239,68,68,0.3))', border: '2px solid rgba(220,38,38,0.7)', backdropFilter: 'blur(10px)'}}>
                  <AlertTriangle size={32} className="text-red-200 mx-auto mb-3 animate-pulse" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                  <p className="text-white font-bold text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>🚨 No payments found {unitFilter && `for Unit ${unitFilter}`}</p>
                  <p className="text-red-200 text-sm mt-2 font-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>URGENT ATTENTION REQUIRED</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>
                Maintenance Requests {unitFilter && `for Unit ${unitFilter}`}
              </h3>
              <Link
                to={`/dashboard/maintenance?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
                className="text-red-300 hover:text-red-200 text-sm font-bold px-3 py-1 rounded-lg border border-red-400/30"
                style={{background: 'rgba(220,38,38,0.2)', textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}
              >
                ⚠️ View All
              </Link>
            </div>
            
            {filteredData.maintenanceRequests.length > 0 ? (
              <div className="space-y-3">
                {filteredData.maintenanceRequests.slice(0, 10).map((request: any) => {
                  const tenant = tenants.find(t => t._id === request.tenantId);
                  return (
                    <div key={request._id} className="p-4 border border-white/20 rounded-lg" style={{background: 'rgba(0, 0, 0, 0.2)'}}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                            <Wrench size={14} className="text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{request.description}</div>
                            <div className="text-sm text-white/70">
                              {tenant?.name || 'Property'} - Unit {tenant?.unit || request.unit}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'Open' ? 'bg-red-100 text-red-800' :
                          request.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">
                          Priority: {request.priority} • {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        {request.cost && (
                          <span className="font-medium text-white">${request.cost}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-6 rounded-2xl border-2" style={{background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.2))', border: '2px solid rgba(34,197,94,0.6)', backdropFilter: 'blur(10px)'}}>
                  <Wrench size={32} className="text-green-200 mx-auto mb-3" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                  <p className="text-white font-bold text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>✅ No maintenance requests {unitFilter && `for Unit ${unitFilter}`}</p>
                  <p className="text-green-200 text-sm mt-2 font-semibold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>All Systems Good!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9)'}}>
                💰 Cash Flow Analysis {unitFilter && `for Unit ${unitFilter}`}
              </h3>
            </div>
            
            {/* Monthly Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              <div className="p-4 rounded-lg border border-white/20" style={{background: 'rgba(34, 197, 94, 0.2)'}}>
                <div className="text-sm text-green-300 mb-1">Total Income</div>
                <div className="text-2xl font-bold text-green-200">
                  ${filteredData.payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-green-300">{filteredData.payments.length} payments</div>
              </div>
              
              <div className="p-4 rounded-lg border border-white/20" style={{background: 'rgba(239, 68, 68, 0.2)'}}>
                <div className="text-sm text-red-300 mb-1">Total Expenses</div>
                <div className="text-2xl font-bold text-red-200">
                  ${unitFilter ? 
                    Math.round(expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / (property.numberOfUnits || 1)).toLocaleString() :
                    expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()
                  }
                </div>
                <div className="text-xs text-red-300">
                  {unitFilter ? 'Allocated share' : `${expenses.length} expenses`}
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-white/20" style={{background: 'rgba(59, 130, 246, 0.2)'}}>
                <div className="text-sm text-blue-300 mb-1">Net Income</div>
                <div className="text-2xl font-bold text-blue-200">
                  ${(
                    filteredData.payments.reduce((sum, p) => sum + (p.amount || 0), 0) -
                    (unitFilter ? 
                      Math.round(expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / (property.numberOfUnits || 1)) :
                      expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
                    )
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-blue-300">This period</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="font-medium text-white mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {[...filteredData.payments.map(p => ({...p, type: 'income'})), 
                  ...(unitFilter ? [] : expenses.map(e => ({...e, type: 'expense'})))]
                  .sort((a, b) => new Date(b.paymentDate || b.date).getTime() - new Date(a.paymentDate || a.date).getTime())
                  .slice(0, 8)
                  .map((transaction: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-white/20" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                        }`}>
                          {transaction.type === 'income' ? 
                            <DollarSign size={12} className="text-white" /> :
                            <TrendingUp size={12} className="text-white" />
                          }
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {transaction.type === 'income' ? 
                              `Payment - ${transaction.rentMonth}` : 
                              transaction.description
                            }
                          </div>
                          <div className="text-xs text-white/70">
                            {new Date(transaction.paymentDate || transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedDataSections;