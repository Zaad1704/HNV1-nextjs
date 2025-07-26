import React from 'react';
import Link from 'next/link';
import { Eye, Share2 } from 'lucide-react';
import UniversalStatusBadge from './UniversalStatusBadge';

interface UniversalGlassyCardProps {
  item: any;
  index: number;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  status: string;
  stats: Array<{
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
  }>;
  badges?: Array<{
    label: string;
    value: string | number;
    color: string;
  }>;
  detailsPath: string;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  secondaryActions?: Array<{
    icon: React.ElementType;
    label: string;
    onClick: (item: any) => void;
    color: string;
  }>;
  imageUrl?: string;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const UniversalGlassyCard: React.FC<UniversalGlassyCardProps> = ({
  item,
  index,
  icon: Icon,
  title,
  subtitle,
  status,
  stats,
  badges = [],
  detailsPath,
  onEdit,
  onDelete,
  secondaryActions = [],
  imageUrl,
  showCheckbox = false,
  isSelected = false,
  onSelect
}) => {
  return (
    <div 
      className={`group border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden relative hover:border-white/30 transition-all duration-500 hover:scale-105 ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
      style={{ animationDelay: `${index * 100}ms`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.3)' }}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect?.(item._id, !isSelected);
            }}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white/90 border-gray-300 hover:border-blue-400'
            }`}
          >
            {isSelected && <Icon size={14} />}
          </button>
        </div>
      )}
      
      {/* Item Image */}
      <div className="h-48 relative overflow-hidden rounded-3xl mb-4" style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.2)'}}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
            style={{objectFit: 'contain', objectPosition: 'center'}}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`fallback-icon w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
          <Icon size={32} className="text-white" />
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <UniversalStatusBadge 
            status={status} 
            variant={status === 'Active' ? 'success' : 'warning'}
          />
          {badges.map((badge, idx) => (
            <span key={idx} className={`${badge.color} text-white px-2 py-1 rounded-full text-xs font-medium`}>
              {badge.label} {badge.value}
            </span>
          ))}
        </div>
      </div>

      {/* Item Info */}
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-white/80">{subtitle}</p>
          <p className="text-xs text-white/70 mt-1">
            Last updated: {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Enhanced Item Metrics */}
        <div className="rounded-2xl p-4 space-y-3 border border-white/40" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.15), rgba(66,165,245,0.15), rgba(102,187,106,0.1))', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)'}}>
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatIcon size={18} className={stat.color} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))', strokeWidth: 2.5}} />
                  <span className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>{stat.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>{stat.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={detailsPath}
            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View Details
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(item);
              }}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Eye size={12} />
              {title.includes('Payment') ? 'Details' : 'Edit'}
            </button>
            
            {secondaryActions.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    action.onClick(item);
                  }}
                  className={`${action.color} text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1`}
                >
                  <ActionIcon size={12} />
                  {action.label}
                </button>
              );
            })}
            
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Delete ${title}?`)) {
                  onDelete?.(item._id);
                }
              }}
              className="bg-gradient-to-r from-red-400 to-red-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Icon size={12} />
              Delete
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                navigator.share({
                  title: title,
                  text: `${title}\n${subtitle}`,
                  url: window.location.origin + detailsPath
                }).catch(err => console.error('Error sharing', err));
              }}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Share2 size={12} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalGlassyCard;