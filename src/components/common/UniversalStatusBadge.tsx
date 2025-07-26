import React from 'react';
import { CheckCircle, AlertCircle, Clock, AlertTriangle } from 'lucide-react';

interface UniversalStatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

const UniversalStatusBadge: React.FC<UniversalStatusBadgeProps> = ({
  status,
  variant = 'neutral',
  size = 'md'
}) => {
  const getStatusColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />;
      case 'warning':
        return <AlertTriangle size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />;
      case 'danger':
        return <AlertCircle size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />;
      case 'info':
        return <Clock size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`${getStatusColor()} ${sizeClasses[size]} rounded-full text-white font-medium flex items-center gap-1`}>
      {getStatusIcon()}
      {status}
    </span>
  );
};

export default UniversalStatusBadge;