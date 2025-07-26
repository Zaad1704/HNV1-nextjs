import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  href,
  trend,
  delay = 0
}) => {
  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="app-surface border border-app-border rounded-3xl p-6 flex flex-col h-full hover:shadow-lg transition-all"
      style={{ 
        backgroundColor: 'var(--app-surface, #FFFFFF)',
        borderColor: 'var(--app-border, #E5E7EB)',
        color: 'var(--text-primary, #111827)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-text-secondary mb-2">{title}</h3>
      <p className="text-3xl font-bold text-text-primary mb-2">{value}</p>
      
      {subtitle && (
        <p className="text-text-secondary text-sm mt-auto">{subtitle}</p>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default QuickStatsCard;