import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface Stat {
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange';
}

interface GlassyUniversalHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  stats?: Stat[];
  actions?: React.ReactNode;
}

const GlassyUniversalHeader: React.FC<GlassyUniversalHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  stats = [],
  actions
}) => {
  const getStatGradient = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-400 to-cyan-400';
      case 'green': return 'from-green-400 to-emerald-400';
      case 'purple': return 'from-purple-400 to-pink-400';
      case 'yellow': return 'from-yellow-400 to-orange-400';
      case 'red': return 'from-red-400 to-pink-400';
      case 'orange': return 'from-orange-400 to-red-400';
      default: return 'from-blue-400 to-cyan-400';
    }
  };

  return (
    <div 
      className="rounded-2xl p-6 relative" 
      style={{
        background: 'linear-gradient(135deg, rgba(255,218,185,0.15), rgba(173,216,230,0.15), rgba(255,218,185,0.1))',
        backdropFilter: 'blur(15px) saturate(150%)', 
        WebkitBackdropFilter: 'blur(15px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Title Section */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center border-2 border-white/20">
            <Icon size={32} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {title}
              </h1>
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-yellow-900" />
              </div>
            </div>
            {subtitle && (
              <p className="text-gray-300 mt-1 text-lg">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="rounded-xl p-4 text-center"
              >
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${getStatGradient(stat.color)} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Actions Section */}
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlassyUniversalHeader;