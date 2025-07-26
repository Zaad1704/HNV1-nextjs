import React from 'react';
import { AlertTriangle, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TenantStatusAlertsProps {
  tenant: any;
  payments?: any[];
  className?: string;
}

const TenantStatusAlerts: React.FC<TenantStatusAlertsProps> = ({ 
  tenant, 
  payments = [], 
  className = '' 
}) => {
  const alerts = [];

  // Payment Status Alert
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthPayments = payments.filter((p: any) => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const currentMonthPaid = currentMonthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const rentAmount = tenant.rentAmount || 0;
  const outstanding = rentAmount - currentMonthPaid;

  if (outstanding > 0) {
    alerts.push({
      type: 'payment',
      severity: tenant.status === 'Late' ? 'high' : 'medium',
      icon: tenant.status === 'Late' ? AlertTriangle : Clock,
      title: tenant.status === 'Late' ? 'Late Payment' : 'Payment Due',
      message: `$${outstanding} outstanding for ${new Date().toLocaleDateString('en-US', { month: 'long' })}`,
      color: tenant.status === 'Late' ? 'red' : 'orange'
    });
  }

  // Lease Expiry Alert
  if (tenant.leaseEndDate) {
    const endDate = new Date(tenant.leaseEndDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      alerts.push({
        type: 'lease',
        severity: 'high',
        icon: XCircle,
        title: 'Lease Expired',
        message: `Expired ${Math.abs(daysUntilExpiry)} days ago`,
        color: 'red'
      });
    } else if (daysUntilExpiry <= 30) {
      alerts.push({
        type: 'lease',
        severity: 'high',
        icon: Calendar,
        title: 'Lease Expiring Soon',
        message: `${daysUntilExpiry} days remaining`,
        color: 'orange'
      });
    } else if (daysUntilExpiry <= 90) {
      alerts.push({
        type: 'lease',
        severity: 'medium',
        icon: Calendar,
        title: 'Renewal Due',
        message: `${daysUntilExpiry} days until expiry`,
        color: 'yellow'
      });
    }
  }

  // Communication Alert
  const lastPayment = payments[0];
  if (lastPayment) {
    const daysSinceLastPayment = Math.floor((Date.now() - new Date(lastPayment.paymentDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastPayment > 45) {
      alerts.push({
        type: 'communication',
        severity: 'low',
        icon: Clock,
        title: 'No Recent Activity',
        message: `Last payment ${daysSinceLastPayment} days ago`,
        color: 'gray'
      });
    }
  }

  if (alerts.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-green-600 text-sm ${className}`}>
        <CheckCircle size={16} />
        <span>All good</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {alerts.map((alert, index) => {
        const Icon = alert.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-2 p-2 rounded-lg bg-${alert.color}-50 border border-${alert.color}-200`}
          >
            <Icon size={16} className={`text-${alert.color}-600 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-${alert.color}-800 text-sm`}>
                {alert.title}
              </div>
              <div className={`text-${alert.color}-600 text-xs truncate`}>
                {alert.message}
              </div>
            </div>
            {alert.severity === 'high' && (
              <div className={`w-2 h-2 bg-${alert.color}-500 rounded-full animate-pulse`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TenantStatusAlerts;