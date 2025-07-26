import React from 'react';
import { User } from 'lucide-react';

interface TenantAvatarProps {
  tenant: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const TenantAvatar: React.FC<TenantAvatarProps> = ({ 
  tenant, 
  size = 'md', 
  showStatus = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };

  const statusColors = {
    Active: 'bg-green-500',
    Late: 'bg-red-500',
    Inactive: 'bg-gray-500',
    Archived: 'bg-yellow-500'
  };

  const getInitials = (name?: string) => {
    if (!name) return 'T';
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientClass = (name?: string) => {
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-teal-500 to-cyan-500',
      'from-indigo-500 to-purple-500'
    ];
    const index = (name?.charCodeAt(0) || 84) % gradients.length;
    return gradients[index];
  };

  // Handle undefined tenant
  if (!tenant) {
    return (
      <div className={`relative ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
          <User size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center relative`}>
        {tenant?.imageUrl || tenant?.tenantImage ? (
          <img
            src={tenant?.imageUrl || tenant?.tenantImage}
            alt={tenant?.name || 'Tenant'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`avatar-fallback w-full h-full bg-gradient-to-br ${getGradientClass(tenant?.name)} flex items-center justify-center text-white font-bold ${tenant?.imageUrl || tenant?.tenantImage ? 'hidden' : ''}`}>
          {tenant?.name ? getInitials(tenant?.name) : <User size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />}
        </div>
      </div>
      
      {showStatus && (
        <div 
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${statusColors[tenant?.status] || 'bg-gray-500'}`}
          title={`Status: ${tenant?.status || 'Unknown'}`}
        ></div>
      )}
    </div>
  );
};

export default TenantAvatar;