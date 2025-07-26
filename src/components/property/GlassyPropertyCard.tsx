import React from 'react';
import { Building2, MapPin, Users, DollarSign, Calendar, Eye, Edit, Trash2 } from 'lucide-react';

interface GlassyPropertyCardProps {
  property: any;
  index: number;
  onEdit: (property: any) => void;
  onDelete: (propertyId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (propertyId: string, selected: boolean) => void;
}

const GlassyPropertyCard: React.FC<GlassyPropertyCardProps> = ({
  property,
  index,
  onEdit,
  onDelete,
  showCheckbox,
  isSelected,
  onSelect
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'from-green-500/30 to-emerald-500/30 border-green-400/30';
      case 'Inactive': return 'from-red-500/30 to-pink-500/30 border-red-400/30';
      case 'Under Renovation': return 'from-yellow-500/30 to-orange-500/30 border-yellow-400/30';
      case 'Archived': return 'from-gray-500/30 to-slate-500/30 border-gray-400/30';
      default: return 'from-blue-500/30 to-purple-500/30 border-blue-400/30';
    }
  };

  return (
    <div 
      className="group rounded-2xl shadow-lg border-2 border-white/20 overflow-hidden relative transition-all duration-500 hover:scale-105 hover:shadow-xl backdrop-blur-xl bg-white/10"
      style={{ 
        animationDelay: `${index * 100}ms`,
        backdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      {/* Enhanced Animated Background with Blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"
        style={{
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)'
        }}
      ></div>
      
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect?.(property._id, e.target.checked)}
            className="w-5 h-5 rounded-lg bg-white/20 border-2 border-white/30 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Property Image/Icon */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Building2 size={40} className="text-white" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-sm bg-gradient-to-r ${getStatusColor(property.status)} border`}>
          <span className="text-white text-xs font-semibold">{property.status}</span>
        </div>

        {/* Floating particles */}
        <div className="absolute top-6 left-6 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-8 right-8 w-1 h-1 bg-white/30 rounded-full animate-ping delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative p-6">
        {/* Property Name */}
        <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          {property.name}
        </h3>

        {/* Address */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-white/60" />
          <p className="text-white/70 text-sm">
            {property.address?.formattedAddress || 'Address not provided'}
          </p>
        </div>

        {/* Property Stats with Enhanced Blur */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div 
            className="rounded-xl p-3 backdrop-blur-xl bg-white/10 border-2 border-white/20"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)'
            }}
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-white/80" />
              <span className="text-white/70 text-sm">Units</span>
            </div>
            <p className="text-white font-semibold text-lg">{property.numberOfUnits || 1}</p>
          </div>
          
          <div 
            className="rounded-xl p-3 backdrop-blur-xl bg-white/10 border-2 border-white/20"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)'
            }}
          >
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-white/80" />
              <span className="text-white/70 text-sm">Value</span>
            </div>
            <p className="text-white font-semibold text-lg">
              ${property.value ? property.value.toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => window.open(`/dashboard/properties/${property._id}`, '_blank')}
            className="flex-1 backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all duration-300"
          >
            <Eye size={16} />
            <span className="font-medium">View</span>
          </button>
          
          <button
            onClick={() => onEdit(property)}
            className="flex-1 backdrop-blur-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all duration-300"
          >
            <Edit size={16} />
            <span className="font-medium">Edit</span>
          </button>
          
          <button
            onClick={() => onDelete(property._id)}
            className="backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-xl py-3 px-2 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Created Date */}
        {property.createdAt && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
            <Calendar size={14} className="text-white/50" />
            <span className="text-white/50 text-xs">
              Added {new Date(property.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default GlassyPropertyCard;