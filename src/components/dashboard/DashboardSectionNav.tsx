import React, { useState } from 'react';
import { Building2, Users, DollarSign, Wrench, FileText, BarChart3, Settings } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  count?: number;
}

interface DashboardSectionNavProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  sections: Section[];
}

const DashboardSectionNav: React.FC<DashboardSectionNavProps> = ({
  activeSection,
  onSectionChange,
  sections
}) => {
  return (
    <div className="mb-8">
      <div 
        className="flex flex-wrap gap-2 p-2 rounded-2xl"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`
                flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm
                transition-all duration-300 transform relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-2xl scale-110 -translate-y-1' 
                  : 'text-white hover:bg-white/20 hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:translate-y-0'
                }
              `}
              style={{
                backdropFilter: isActive ? 'blur(20px) saturate(200%)' : 'blur(10px)',
                boxShadow: isActive ? '0 12px 40px rgba(255, 165, 0, 0.3), 0 8px 20px rgba(0, 123, 255, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: isActive ? '2px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Icon size={16} />
              <span>{section.label}</span>
              {section.count !== undefined && (
                <span 
                  className={`
                    px-3 py-1 rounded-full text-xs font-bold transition-all duration-300
                    ${isActive 
                      ? 'bg-white/30 text-white shadow-lg' 
                      : 'bg-white/15 text-white/90'
                    }
                  `}
                  style={{
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {section.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSectionNav;