import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface UniversalCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  delay?: number;
  gradient?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  section?: 'property' | 'tenant' | 'payment' | 'maintenance';
}

const UniversalCard: React.FC<UniversalCardProps> = ({ 
  children, 
  onClick, 
  className = '', 
  delay = 0,
  gradient = 'blue',
  section
}) => {
  const { getGradientClass } = useTheme();
  const gradientClasses = {
    blue: 'from-brand-blue/5 via-purple-500/5 to-brand-orange/5',
    green: 'from-green-500/5 via-emerald-500/5 to-green-600/5',
    red: 'from-red-500/5 via-rose-500/5 to-red-600/5',
    purple: 'from-purple-500/5 via-violet-500/5 to-purple-600/5',
    orange: 'from-orange-500/5 via-amber-500/5 to-orange-600/5'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`group backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 hover:shadow-2xl hover:shadow-brand-blue/10 hover:border-brand-blue/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{backdropFilter: 'blur(20px) saturate(180%)'}}
      onClick={onClick}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]} opacity-0 group-hover:opacity-100 transition-all duration-500 ${section ? getGradientClass(section) : ''}`} style={{backdropFilter: 'blur(24px) saturate(200%)'}}></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" style={{backdropFilter: 'blur(24px) saturate(200%)'}}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default UniversalCard;