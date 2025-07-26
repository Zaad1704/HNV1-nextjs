import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, ExternalLink } from 'lucide-react';

interface ActionableNotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'maintenance' | 'system';
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  onMarkAsRead: (id: string) => void;
  onAction?: (id: string, actionUrl?: string) => void;
}

const ActionableNotification: React.FC<ActionableNotificationProps> = ({
  id,
  title,
  message,
  type,
  actionUrl,
  isRead,
  createdAt,
  onMarkAsRead,
  onAction
}) => {
  const router = useRouter();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'payment':
        return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">$</div>;
      case 'maintenance':
        return <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">🔧</div>;
      case 'system':
        return <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">⚙️</div>;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    if (isRead) return 'bg-gray-50 dark:bg-gray-800/50';
    
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'payment':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
      case 'maintenance':
        return 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500';
      case 'system':
        return 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    }
  };

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id);
    }
    
    if (actionUrl) {
      if (onAction) {
        onAction(id, actionUrl);
      } else {
        // Default action - navigate to URL
        if (actionUrl.startsWith('http')) {
          window.open(actionUrl, '_blank');
        } else {
          router.push(actionUrl);
        }
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div
      className={`
        ${getBgColor()}
        p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
        ${!isRead ? 'ring-1 ring-blue-200 dark:ring-blue-800' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm ${isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {title}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(createdAt)}
              </span>
              {!isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className={`text-sm mt-1 ${isRead ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
            {message}
          </p>
          
          {actionUrl && (
            <div className="flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <span>Take Action</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionableNotification;