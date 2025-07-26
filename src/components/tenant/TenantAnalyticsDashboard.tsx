import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import apiClient from '@/lib/api';

interface TenantAnalyticsDashboardProps {
  tenantId: string;
  className?: string;
}

const TenantAnalyticsDashboard: React.FC<TenantAnalyticsDashboardProps> = ({ tenantId, className = '' }) => {
  const { data: analytics } = useQuery({
    queryKey: ['tenantAnalytics', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}/analytics`);
      return data.data;
    },
    staleTime: 300000
  });

  const { data: stats } = useQuery({
    queryKey: ['tenantStats', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}/stats`);
      return data.data;
    },
    staleTime: 300000
  });

  if (!analytics || !stats) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-32 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
          <div className="h-24 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
        </div>
      </div>
    );
  }

  const paymentScore = Math.round((stats.payments.paymentRate || 0));
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Financial Overview */}
      <div className="rounded-2xl p-6 border-2 border-white/30" style={{background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))', backdropFilter: 'blur(15px)'}}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3B82F6, #A855F7)'}}>
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Financial Overview</h3>
            <p className="text-sm text-white/70">Payment history and trends</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl p-4 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="text-2xl font-bold text-green-300">${stats.payments.totalAmount.toLocaleString()}</div>
            <div className="text-sm text-white/70">Total Paid</div>
            <div className="text-xs text-white/50">{stats.payments.total} payments</div>
          </div>
          
          <div className="rounded-xl p-4 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="text-2xl font-bold text-blue-300">${stats.payments.monthlyPaid.toLocaleString()}</div>
            <div className="text-sm text-white/70">This Month</div>
            <div className="text-xs text-white/50">Current period</div>
          </div>
          
          <div className="rounded-xl p-4 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className={`text-2xl font-bold ${stats.payments.outstanding > 0 ? 'text-red-300' : 'text-green-300'}`}>
              ${stats.payments.outstanding.toLocaleString()}
            </div>
            <div className="text-sm text-white/70">Outstanding</div>
            <div className="text-xs text-white/50">Current balance</div>
          </div>
          
          <div className="rounded-xl p-4 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className={`text-2xl font-bold text-${getScoreColor(paymentScore)}-300`}>
              {paymentScore}%
            </div>
            <div className="text-sm text-white/70">Payment Score</div>
            <div className="text-xs text-white/50">Punctuality rate</div>
          </div>
        </div>
      </div>

      {/* Payment Timeline */}
      {analytics.monthlyPayments && (
        <div className="rounded-2xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={20} className="text-blue-300" />
            <h3 className="font-bold text-lg text-white">Payment Timeline</h3>
          </div>
          
          <div className="flex items-end gap-2 h-32">
            {analytics.monthlyPayments.map((month: any, index: number) => {
              const maxAmount = Math.max(...analytics.monthlyPayments.map((m: any) => m.payments));
              const height = maxAmount > 0 ? (month.payments / maxAmount) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full rounded-t-lg transition-all duration-500" 
                    style={{ 
                      height: `${height}%`, 
                      minHeight: height > 0 ? '8px' : '2px',
                      background: 'linear-gradient(to top, rgba(59, 130, 246, 0.7), rgba(168, 85, 247, 0.7))'
                    }}
                    title={`${month.month}: $${month.payments}`}
                  ></div>
                  <div className="text-xs text-white/70 mt-2 transform -rotate-45 origin-left">
                    {month.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Behavioral Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={20} className="text-green-300" />
            <h3 className="font-bold text-lg text-white">Payment Behavior</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">On-time Payments</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${paymentScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-white">{paymentScore}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Avg Days Late</span>
              <span className="text-sm font-medium text-white">
                {stats.payments.total > 0 ? Math.round((stats.lease.monthsSinceStart - stats.payments.total) * 30 / stats.payments.total) : 0} days
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Communication</span>
              <div className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-300" />
                <span className="text-sm font-medium text-white">Responsive</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} className="text-purple-300" />
            <h3 className="font-bold text-lg text-white">Lease Insights</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Tenure</span>
              <span className="text-sm font-medium text-white">{stats.lease.monthsSinceStart} months</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Renewal Probability</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(paymentScore + 10, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-white">{Math.min(paymentScore + 10, 100)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Maintenance Requests</span>
              <span className="text-sm font-medium text-white">{stats.maintenance.total} total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="rounded-2xl p-6 border-2 border-orange-400/30" style={{background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.2))', backdropFilter: 'blur(15px)'}}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-orange-300" />
          <h3 className="font-bold text-lg text-white">Risk Assessment</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${paymentScore >= 80 ? 'text-green-300' : paymentScore >= 60 ? 'text-yellow-300' : 'text-red-300'}`}>
                {paymentScore >= 80 ? 'Low' : paymentScore >= 60 ? 'Medium' : 'High'}
              </div>
              <div className="text-sm text-white/70">Payment Risk</div>
            </div>
          </div>
          
          <div className="rounded-xl p-4 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">
                {stats.maintenance.open === 0 ? 'Low' : stats.maintenance.open <= 2 ? 'Medium' : 'High'}
              </div>
              <div className="text-sm text-white/70">Maintenance Risk</div>
            </div>
          </div>
          
          <div className="rounded-xl p-4 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300">
                {stats.lease.monthsSinceStart >= 12 ? 'Low' : 'Medium'}
              </div>
              <div className="text-sm text-white/70">Turnover Risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAnalyticsDashboard;