import React from 'react';
import { Sparkles, LucideIcon, Star } from 'lucide-react';

interface UniversalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  stats?: Array<{
    label: string;
    value: string | number;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  }>;
  actions?: React.ReactNode;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  stats = [],
  actions
}) => {
  const getStatColor = (color: string = 'blue') => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatsBorderColors = () => {
    const statColors = stats.map(stat => {
      const colorMap = {
        blue: '#45B7D1',
        green: '#4ECDC4', 
        purple: '#9B59B6',
        yellow: '#F39C12',
        red: '#E74C3C'
      };
      return colorMap[stat.color as keyof typeof colorMap] || '#45B7D1';
    });
    return statColors.length > 0 ? statColors.join(', ') : '#45B7D1, #4ECDC4';
  };

  return (
    <div className="relative">
      {/* Animated flowing boundary */}
      <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: `linear-gradient(135deg, ${getStatsBorderColors()})`, animation: 'borderFlow 3s ease-in-out infinite'}}></div>
      
      <div className="relative flex items-center justify-between p-4 rounded-3xl border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
        <div className="flex items-center gap-4">
          {Icon && <Icon size={20} className="text-white" />}
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{title}</h1>
            {subtitle && (
              <div className="flex items-center gap-2 text-white/90 mt-1">
                <span>{subtitle}</span>
              </div>
            )}
          </div>
        </div>
        
        {stats.length > 0 && (
          <div className="flex items-center gap-2">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-3 py-1 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                <p className="text-xs text-white/70">{stat.label}</p>
                <p className="font-medium text-white text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalHeader;