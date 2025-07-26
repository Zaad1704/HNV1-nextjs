import React from 'react';
import { TrendingUp, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface PaymentAnalyticsDashboardProps {
  payments: any[];
  className?: string;
}

const PaymentAnalyticsDashboard: React.FC<PaymentAnalyticsDashboardProps> = ({ 
  payments,
  className = ''
}) => {
  // Calculate payment statistics
  const getPaymentStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Current month payments
    const thisMonthPayments = payments.filter(p => {
      const date = new Date(p.paymentDate || p.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Last month payments
    const lastMonth = new Date(currentYear, currentMonth - 1);
    const lastMonthPayments = payments.filter(p => {
      const date = new Date(p.paymentDate || p.createdAt);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    });
    
    const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const growth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    
    // Status counts
    const completed = payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    
    // Calculate success rate
    const successRate = payments.length > 0 ? (completed / payments.length) * 100 : 0;
    
    return {
      thisMonthTotal,
      lastMonthTotal,
      growth,
      completed,
      pending,
      failed,
      successRate,
      total: payments.length
    };
  };
  
  const stats = getPaymentStats();
  
  // Generate simple bar chart data for monthly comparison
  const generateBarChartData = () => {
    const months = [];
    const values = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push(monthName);
      
      const monthPayments = payments.filter(p => {
        const date = new Date(p.paymentDate || p.createdAt);
        return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
      });
      
      const total = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      values.push(total);
    }
    
    return { months, values };
  };
  
  const chartData = generateBarChartData();
  const maxValue = Math.max(...chartData.values, 1);
  
  return (
    <div className={`rounded-2xl p-6 border-2 border-white/20 ${className}`} style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'}}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-300" />
          Payment Analytics
        </h2>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="text-sm text-blue-300 mb-1">This Month</div>
          <div className="text-2xl font-bold text-white">${stats.thisMonthTotal.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={14} className={stats.growth >= 0 ? 'text-green-400' : 'text-red-400 transform rotate-180'} />
            <span className={stats.growth >= 0 ? 'text-xs text-green-400' : 'text-xs text-red-400'}>
              {Math.abs(stats.growth).toFixed(1)}%
            </span>
            <span className="text-xs text-white/60">vs last month</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="text-sm text-green-300 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</div>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-white/60">{stats.completed} completed</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 border border-yellow-500/30">
          <div className="text-sm text-yellow-300 mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
          <div className="flex items-center gap-1 mt-1">
            <Clock size={14} className="text-yellow-400" />
            <span className="text-xs text-white/60">Awaiting completion</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl p-4 border border-red-500/30">
          <div className="text-sm text-red-300 mb-1">Failed</div>
          <div className="text-2xl font-bold text-white">{stats.failed}</div>
          <div className="flex items-center gap-1 mt-1">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs text-white/60">Need attention</span>
          </div>
        </div>
      </div>
      
      {/* Simple Bar Chart */}
      <div className="mb-6">
        <div className="text-sm font-medium text-white/80 mb-3">Monthly Payment Trends</div>
        <div className="flex items-end h-40 gap-2">
          {chartData.months.map((month, index) => (
            <div key={month} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500/50 to-purple-500/50 rounded-t-md"
                style={{ 
                  height: `${(chartData.values[index] / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              ></div>
              <div className="text-xs text-white/70 mt-2">{month}</div>
              <div className="text-xs font-medium text-white mt-1">${chartData.values[index].toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="border-t border-white/10 pt-4">
        <div className="text-sm font-medium text-white/80 mb-3">Recommendations</div>
        <div className="space-y-2">
          {stats.pending > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Follow up on pending payments</div>
                <div className="text-xs text-white/70">You have {stats.pending} pending payments that need attention</div>
              </div>
            </div>
          )}
          
          {stats.failed > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Review failed payments</div>
                <div className="text-xs text-white/70">Address {stats.failed} failed payments to improve collection rate</div>
              </div>
            </div>
          )}
          
          {stats.growth < 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <TrendingUp size={16} className="text-blue-400 mt-0.5 flex-shrink-0 transform rotate-180" />
              <div>
                <div className="text-sm font-medium text-white">Payment volume decreased</div>
                <div className="text-xs text-white/70">This month's payments are down {Math.abs(stats.growth).toFixed(1)}% compared to last month</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalyticsDashboard;