import React from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';

interface ActionItem {
  id: string;
  primaryText: string;
  secondaryText: string;
}

interface ActionItemWidgetProps {
  title: string;
  items: ActionItem[];
  actionText: string;
  emptyText: string;
  linkTo: string;
  onActionClick?: (itemId: string) => void;
  isActionLoading?: boolean;
  loadingItemId?: string | null;
}

const ActionItemWidget: React.FC<ActionItemWidgetProps> = ({
  title,
  items,
  actionText,
  emptyText,
  linkTo,
  onActionClick,
  isActionLoading = false,
  loadingItemId = null
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <Link 
          to={linkTo}
          className="text-brand-blue hover:text-brand-blue/80 text-sm font-medium flex items-center gap-1"
        >
          View All <ExternalLink size={14} />
        </Link>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-app-bg rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-text-primary text-sm">{item.primaryText}</p>
                <p className="text-text-secondary text-xs mt-1">{item.secondaryText}</p>
              </div>
              {onActionClick && (
                <button
                  onClick={() => onActionClick(item.id)}
                  disabled={isActionLoading && loadingItemId === item.id}
                  className="px-3 py-1 bg-brand-blue text-white text-xs rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 flex items-center gap-1"
                >
                  {isActionLoading && loadingItemId === item.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    actionText
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionItemWidget;