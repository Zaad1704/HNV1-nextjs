import React from 'react';
import { Star, TrendingUp, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface TenantScoreCardProps {
  tenant: any;
  payments?: any[];
  className?: string;
}

const TenantScoreCard: React.FC<TenantScoreCardProps> = ({ tenant, payments = [], className = '' }) => {
  // Calculate tenant score based on multiple factors
  const calculateScore = () => {
    let score = 100;
    let factors = [];

    // Payment punctuality (40% weight)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const recentPayments = payments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      const monthsAgo = (currentYear - paymentDate.getFullYear()) * 12 + (currentMonth - paymentDate.getMonth());
      return monthsAgo <= 6; // Last 6 months
    });

    if (recentPayments.length > 0) {
      const latePayments = recentPayments.filter((p: any) => {
        const paymentDate = new Date(p.paymentDate);
        const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 5); // 5th of month
        return paymentDate > expectedDate;
      });
      
      const punctualityScore = ((recentPayments.length - latePayments.length) / recentPayments.length) * 100;
      const punctualityWeight = 0.4;
      score = score * (1 - punctualityWeight) + punctualityScore * punctualityWeight;
      
      factors.push({
        name: 'Payment Punctuality',
        score: Math.round(punctualityScore),
        weight: 40,
        status: punctualityScore >= 90 ? 'excellent' : punctualityScore >= 70 ? 'good' : 'poor'
      });
    }

    // Lease tenure (20% weight)
    if (tenant.leaseStartDate) {
      const tenureMonths = Math.floor((Date.now() - new Date(tenant.leaseStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      const tenureScore = Math.min(100, (tenureMonths / 12) * 100); // Max score at 12 months
      const tenureWeight = 0.2;
      score = score * (1 - tenureWeight) + tenureScore * tenureWeight;
      
      factors.push({
        name: 'Lease Tenure',
        score: Math.round(tenureScore),
        weight: 20,
        status: tenureMonths >= 12 ? 'excellent' : tenureMonths >= 6 ? 'good' : 'fair'
      });
    }

    // Payment consistency (25% weight)
    if (payments.length > 0) {
      const totalExpected = payments.length * (tenant.rentAmount || 0);
      const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const consistencyScore = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 100;
      const consistencyWeight = 0.25;
      score = score * (1 - consistencyWeight) + consistencyScore * consistencyWeight;
      
      factors.push({
        name: 'Payment Consistency',
        score: Math.round(consistencyScore),
        weight: 25,
        status: consistencyScore >= 95 ? 'excellent' : consistencyScore >= 85 ? 'good' : 'poor'
      });
    }

    // Current status (15% weight)
    const statusScore = tenant.status === 'Active' ? 100 : tenant.status === 'Late' ? 50 : 75;
    const statusWeight = 0.15;
    score = score * (1 - statusWeight) + statusScore * statusWeight;
    
    factors.push({
      name: 'Current Status',
      score: statusScore,
      weight: 15,
      status: tenant.status === 'Active' ? 'excellent' : tenant.status === 'Late' ? 'poor' : 'fair'
    });

    return {
      overall: Math.round(score),
      factors,
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
      risk: score >= 80 ? 'Low' : score >= 60 ? 'Medium' : 'High'
    };
  };

  const scoreData = calculateScore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'yellow';
    if (score >= 60) return 'orange';
    return 'red';
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'A': return <Star className="text-green-500" size={20} />;
      case 'B': return <CheckCircle className="text-blue-500" size={20} />;
      case 'C': return <TrendingUp className="text-yellow-500" size={20} />;
      case 'D': return <AlertTriangle className="text-orange-500" size={20} />;
      default: return <AlertTriangle className="text-red-500" size={20} />;
    }
  };

  return (
    <div className={`rounded-2xl border border-white/20 p-6 ${className}`} style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-blue-300" />
          <h3 className="font-bold text-lg text-white">Tenant Score</h3>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            {getGradeIcon(scoreData.grade)}
            <span className="text-2xl font-bold text-white">{scoreData.grade}</span>
          </div>
          <div className="text-sm text-white/70">Grade</div>
        </div>
      </div>

      {/* Overall Score Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={`rgb(${getScoreColor(scoreData.overall) === 'green' ? '34, 197, 94' : 
                getScoreColor(scoreData.overall) === 'blue' ? '59, 130, 246' :
                getScoreColor(scoreData.overall) === 'yellow' ? '234, 179, 8' :
                getScoreColor(scoreData.overall) === 'orange' ? '249, 115, 22' : '239, 68, 68'})`}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(scoreData.overall / 100) * 314} 314`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold text-${getScoreColor(scoreData.overall)}-300`}>
                {scoreData.overall}
              </div>
              <div className="text-sm text-white/70">Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Risk Level</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getScoreColor(scoreData.overall)}-500/20 text-${getScoreColor(scoreData.overall)}-300`}>
            {scoreData.risk} Risk
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`bg-${getScoreColor(scoreData.overall)}-500 h-2 rounded-full transition-all duration-1000`}
            style={{ width: `${100 - scoreData.overall}%` }}
          ></div>
        </div>
      </div>

      {/* Score Factors */}
      <div className="space-y-3">
        <h4 className="font-semibold text-white text-sm">Score Breakdown</h4>
        {scoreData.factors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/80">{factor.name}</span>
                <span className="text-sm font-medium text-white">{factor.score}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className={`bg-${getScoreColor(factor.score)}-500 h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${factor.score}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-3 text-xs text-white/50">
              {factor.weight}%
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 rounded-xl border border-blue-400/30" style={{background: 'rgba(59, 130, 246, 0.1)', backdropFilter: 'blur(5px)'}}>
        <h4 className="font-semibold text-blue-300 text-sm mb-2">Recommendations</h4>
        <div className="text-sm text-blue-200">
          {scoreData.overall >= 90 ? (
            "Excellent tenant! Consider offering lease renewal incentives."
          ) : scoreData.overall >= 80 ? (
            "Good tenant with minor areas for improvement. Monitor payment patterns."
          ) : scoreData.overall >= 70 ? (
            "Average performance. Consider payment reminders and regular check-ins."
          ) : scoreData.overall >= 60 ? (
            "Below average. Implement stricter payment monitoring and communication."
          ) : (
            "High risk tenant. Consider lease review and enhanced monitoring."
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantScoreCard;