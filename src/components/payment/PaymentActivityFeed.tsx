import React from 'react';
import { CreditCard, CheckCircle, AlertTriangle, Clock, Calendar } from 'lucide-react';

interface PaymentActivityFeedProps {
  payments: any[];
}

const PaymentActivityFeed: React.FC<PaymentActivityFeedProps> = ({ payments }) => {
  // Get recent payments (last 7 days)
  const getRecentPayments = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return payments
      .filter(payment => {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        return paymentDate >= sevenDaysAgo;
      })
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate || a.createdAt);
        const dateB = new Date(b.paymentDate || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  };

  const recentPayments = getRecentPayments();
  
  if (recentPayments.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return { icon: CheckCircle, color: 'green' };
      case 'pending':
        return { icon: Clock, color: 'yellow' };
      case 'failed':
        return { icon: AlertTriangle, color: 'red' };
      default:
        return { icon: Clock, color: 'gray' };
    }
  };

  return (
    <div className="hidden md:block">
      <div 
        className="rounded-2xl p-4 border-2 border-white/20 mb-6"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-blue-300" />
            Recent Payment Activity
          </h3>
        </div>
        
        <div className="space-y-3">
          {recentPayments.map((payment) => {
            const statusInfo = getStatusIcon(payment.status);
            const StatusIcon = statusInfo.icon;
            const paymentDate = new Date(payment.paymentDate || payment.createdAt);
            
            return (
              <div 
                key={payment._id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                style={{ borderLeft: `3px solid rgba(${statusInfo.color === 'green' ? '34, 197, 94' : statusInfo.color === 'yellow' ? '234, 179, 8' : '239, 68, 68'}, 0.7)` }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `rgba(${statusInfo.color === 'green' ? '34, 197, 94' : statusInfo.color === 'yellow' ? '234, 179, 8' : '239, 68, 68'}, 0.2)`,
                    border: `1px solid rgba(${statusInfo.color === 'green' ? '34, 197, 94' : statusInfo.color === 'yellow' ? '234, 179, 8' : '239, 68, 68'}, 0.3)`
                  }}
                >
                  <CreditCard size={16} className={`text-${statusInfo.color === 'green' ? 'green' : statusInfo.color === 'yellow' ? 'yellow' : 'red'}-300`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-white">
                      {payment.tenantId?.name || 'Unknown Tenant'}
                    </div>
                    <div className="text-sm text-white/70">
                      {paymentDate.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-white/70">
                      {payment.propertyId?.name || 'Unknown Property'}
                      {payment.tenantId?.unit ? ` (Unit ${payment.tenantId.unit})` : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusIcon size={12} className={`text-${statusInfo.color === 'green' ? 'green' : statusInfo.color === 'yellow' ? 'yellow' : 'red'}-300`} />
                      <span className={`text-xs text-${statusInfo.color === 'green' ? 'green' : statusInfo.color === 'yellow' ? 'yellow' : 'red'}-300`}>
                        {payment.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentActivityFeed;