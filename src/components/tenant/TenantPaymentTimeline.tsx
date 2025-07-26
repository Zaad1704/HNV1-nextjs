import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api';

interface TenantPaymentTimelineProps {
  tenantId: string;
  className?: string;
}

const TenantPaymentTimeline: React.FC<TenantPaymentTimelineProps> = ({ tenantId, className = '' }) => {
  const { data: payments = [] } = useQuery({
    queryKey: ['tenantPayments', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payments?tenantId=${tenantId}`);
      return data.data || [];
    },
    staleTime: 300000
  });

  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}`);
      return data.data;
    },
    staleTime: 600000
  });

  // Generate payment timeline with expected vs actual
  const timeline = React.useMemo(() => {
    if (!tenant || !tenant.leaseStartDate) return [];

    const startDate = new Date(tenant.leaseStartDate);
    const endDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : new Date();
    const timeline = [];
    
    let currentDate = new Date(startDate);
    currentDate.setDate(1); // Start from first of month
    
    while (currentDate <= endDate && timeline.length < 24) { // Max 24 months
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const monthPayments = payments.filter((p: any) => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getFullYear() === currentDate.getFullYear() && 
               paymentDate.getMonth() === currentDate.getMonth();
      });
      
      const totalPaid = monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const expectedAmount = tenant.rentAmount || 0;
      const daysLate = monthPayments.length > 0 ? 
        Math.max(0, Math.floor((new Date(monthPayments[0].paymentDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))) : 
        (currentDate < new Date() ? 30 : 0);
      
      timeline.push({
        month: currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        fullDate: new Date(currentDate),
        expected: expectedAmount,
        paid: totalPaid,
        payments: monthPayments,
        status: totalPaid >= expectedAmount ? 'paid' : totalPaid > 0 ? 'partial' : currentDate < new Date() ? 'late' : 'pending',
        daysLate
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return timeline.reverse(); // Most recent first
  }, [tenant, payments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} className="text-green-300" />;
      case 'partial': return <Clock size={16} className="text-yellow-300" />;
      case 'late': return <XCircle size={16} className="text-red-300" />;
      default: return <Clock size={16} className="text-white/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'partial': return 'yellow';
      case 'late': return 'red';
      default: return 'gray';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'paid': return 'rgba(34, 197, 94, 0.2)';
      case 'partial': return 'rgba(234, 179, 8, 0.2)';
      case 'late': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'paid': return 'rgba(34, 197, 94, 0.5)';
      case 'partial': return 'rgba(234, 179, 8, 0.5)';
      case 'late': return 'rgba(239, 68, 68, 0.5)';
      default: return 'rgba(107, 114, 128, 0.5)';
    }
  };

  if (!timeline.length) {
    return (
      <div className={`rounded-2xl p-6 text-center ${className}`} style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <Calendar size={32} className="text-white/50 mx-auto mb-2" />
        <p className="text-white/70">No payment timeline available</p>
      </div>
    );
  }

  const totalExpected = timeline.reduce((sum, t) => sum + t.expected, 0);
  const totalPaid = timeline.reduce((sum, t) => sum + t.paid, 0);
  const paymentRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

  return (
    <div className={`rounded-2xl border border-white/20 ${className}`} style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-blue-300" />
            <h3 className="font-bold text-lg text-white">Payment Timeline</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-300">{paymentRate}%</div>
            <div className="text-sm text-white/70">Payment Rate</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">${totalExpected.toLocaleString()}</div>
            <div className="text-sm text-white/70">Expected</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-300">${totalPaid.toLocaleString()}</div>
            <div className="text-sm text-white/70">Received</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-300">${(totalExpected - totalPaid).toLocaleString()}</div>
            <div className="text-sm text-white/70">Outstanding</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {timeline.map((month, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl border-l-4 hover:scale-[1.02] transition-all duration-300"
              style={{
                borderLeftColor: getStatusBorder(month.status),
                background: getStatusBg(month.status),
                backdropFilter: 'blur(5px)'
              }}
            >
              <div className="flex-shrink-0">
                {getStatusIcon(month.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-white">{month.month}</div>
                  <div className="text-sm text-white/70">
                    {month.fullDate.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-white/70">
                      Expected: <span className="font-medium text-white">${month.expected.toLocaleString()}</span>
                    </span>
                    <span className={`text-${getStatusColor(month.status)}-300`}>
                      Paid: <span className="font-medium">${month.paid.toLocaleString()}</span>
                    </span>
                  </div>
                  
                  {month.daysLate > 0 && month.status !== 'paid' && (
                    <div className="flex items-center gap-1 text-red-300">
                      <AlertTriangle size={12} />
                      <span className="text-xs">{month.daysLate} days late</span>
                    </div>
                  )}
                </div>
                
                {/* Payment progress bar */}
                <div className="mt-2">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`bg-${getStatusColor(month.status)}-500 h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min((month.paid / month.expected) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <div className={`text-lg font-bold text-${getStatusColor(month.status)}-300`}>
                  {month.status === 'paid' ? '100%' : 
                   month.status === 'partial' ? `${Math.round((month.paid / month.expected) * 100)}%` :
                   month.status === 'late' ? '0%' : '-'}
                </div>
                <div className="text-xs text-white/50">
                  {month.payments.length} payment{month.payments.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenantPaymentTimeline;