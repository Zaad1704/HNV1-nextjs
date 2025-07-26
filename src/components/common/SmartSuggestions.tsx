import React, { useState, useEffect } from 'react';
import { Lightbulb, X, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCrossData } from '@/hooks/useCrossData';
import { useRouter } from 'next/navigation';

interface Suggestion {
  id: string;
  type: 'optimization' | 'alert' | 'opportunity';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const SmartSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const { stats, properties, tenants, payments, expenses } = useCrossData();
  const router = useRouter();

  useEffect(() => {
    generateSuggestions();
  }, [stats, properties, tenants, payments, expenses]);

  const generateSuggestions = () => {
    const newSuggestions: Suggestion[] = [];

    // Low occupancy alert
    if (stats?.occupancyRate < 80) {
      newSuggestions.push({
        id: 'low-occupancy',
        type: 'alert',
        title: 'Low Occupancy Rate',
        description: `Your occupancy rate is ${stats.occupancyRate}%. Consider marketing vacant units.`,
        action: 'View vacant properties',
        actionUrl: '/dashboard/properties?filter=vacant',
        priority: 'high'
      });
    }

    // Late payment optimization
    const latePayments = tenants?.filter((t: any) => t.status === 'Late').length || 0;
    if (latePayments > 0) {
      newSuggestions.push({
        id: 'late-payments',
        type: 'optimization',
        title: 'Late Payment Follow-up',
        description: `${latePayments} tenants have late payments. Set up automated reminders.`,
        action: 'Create reminders',
        actionUrl: '/dashboard/reminders',
        priority: 'medium'
      });
    }

    // Maintenance opportunity
    const openMaintenance = stats?.openMaintenance || 0;
    if (openMaintenance > 5) {
      newSuggestions.push({
        id: 'maintenance-backlog',
        type: 'alert',
        title: 'Maintenance Backlog',
        description: `${openMaintenance} open maintenance requests. Consider prioritizing urgent items.`,
        action: 'View maintenance',
        actionUrl: '/dashboard/maintenance',
        priority: 'high'
      });
    }

    // Cash flow opportunity
    const netFlow = (stats?.totalIncome || 0) - (stats?.totalExpenses || 0);
    if (netFlow > 10000) {
      newSuggestions.push({
        id: 'investment-opportunity',
        type: 'opportunity',
        title: 'Investment Opportunity',
        description: `Strong cash flow of $${netFlow.toLocaleString()}. Consider property improvements or expansion.`,
        action: 'View cash flow',
        actionUrl: '/dashboard/cash-flow',
        priority: 'low'
      });
    }

    // Expense optimization
    const monthlyExpenses = stats?.totalExpenses || 0;
    if (monthlyExpenses > (stats?.totalIncome || 0) * 0.7) {
      newSuggestions.push({
        id: 'high-expenses',
        type: 'alert',
        title: 'High Expense Ratio',
        description: 'Expenses are over 70% of income. Review and optimize costs.',
        action: 'View expenses',
        actionUrl: '/dashboard/expenses',
        priority: 'medium'
      });
    }

    setSuggestions(newSuggestions.filter(s => !dismissed.includes(s.id)));
  };

  const dismissSuggestion = (id: string) => {
    setDismissed([...dismissed, id]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'opportunity': return CheckCircle;
      default: return Lightbulb;
    }
  };

  const getColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-200 bg-red-50';
    if (priority === 'medium') return 'border-yellow-200 bg-yellow-50';
    return 'border-green-200 bg-green-50';
  };

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb size={20} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">Smart Suggestions</h3>
      </div>
      
      {suggestions.map((suggestion) => {
        const Icon = getIcon(suggestion.type);
        return (
          <div
            key={suggestion.id}
            className={`p-4 rounded-xl border-2 ${getColor(suggestion.type, suggestion.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Icon size={20} className={getIconColor(suggestion.type, suggestion.priority)} />
                <div>
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  {suggestion.action && (
                    <button 
                      onClick={() => {
                        if (suggestion.actionUrl) {
                          if (suggestion.actionUrl.startsWith('/dashboard/')) {
                            router.push(suggestion.actionUrl);
                          } else {
                            window.location.href = suggestion.actionUrl;
                          }
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium cursor-pointer"
                    >
                      {suggestion.action} →
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismissSuggestion(suggestion.id)}
                className="p-1 hover:bg-white/50 rounded-lg"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SmartSuggestions;