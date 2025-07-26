import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UsageLimitWarningProps {
  usage: number;
  limit: number;
  type: string;
  className?: string;
}

const UsageLimitWarning: React.FC<UsageLimitWarningProps> = ({ usage, limit, type, className = '' }) => {
  const router = useRouter();
  const percentage = Math.round((usage / limit) * 100);
  
  // Only show warning if usage is above 80%
  if (percentage < 80) {
    return null;
  }

  const isAtLimit = usage >= limit;
  const isNearLimit = percentage >= 90;

  return (
    <div className={`rounded-xl p-4 ${className} ${
      isAtLimit 
        ? 'bg-red-50 border border-red-200' 
        : isNearLimit 
        ? 'bg-orange-50 border border-orange-200'
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${
          isAtLimit ? 'text-red-400' : isNearLimit ? 'text-orange-400' : 'text-yellow-400'
        }`}>
          {isAtLimit ? <AlertTriangle className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            isAtLimit ? 'text-red-800' : isNearLimit ? 'text-orange-800' : 'text-yellow-800'
          }`}>
            {isAtLimit 
              ? `${type} Limit Reached` 
              : `${type} Limit Warning`
            }
          </h3>
          <p className={`text-sm mt-1 ${
            isAtLimit ? 'text-red-700' : isNearLimit ? 'text-orange-700' : 'text-yellow-700'
          }`}>
            {isAtLimit 
              ? `You've reached your ${type.toLowerCase()} limit (${usage}/${limit}). Upgrade to add more.`
              : `You're using ${usage} of ${limit} ${type.toLowerCase()} (${percentage}%). Consider upgrading soon.`
            }
          </p>
        </div>
        <button
          onClick={() => router.push('/billing')}
          className={`ml-4 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isAtLimit 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : isNearLimit 
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          Upgrade
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit 
                ? 'bg-red-500' 
                : isNearLimit 
                ? 'bg-orange-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500">{usage} used</span>
          <span className="text-gray-500">{limit} limit</span>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitWarning;