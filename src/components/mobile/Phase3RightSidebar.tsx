import React, { useState } from 'react';
import { ChevronDown, Filter, Sparkles } from 'lucide-react';

interface SidebarSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number }>;
  content: React.ReactNode;
  defaultExpanded?: boolean;
  gradient?: string;
}

interface Phase3RightSidebarProps {
  sections: SidebarSection[];
  className?: string;
}

const Phase3RightSidebar: React.FC<Phase3RightSidebarProps> = ({
  sections,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded).map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className={`phase3-right-sidebar ${className}`}>
      {sections.map((section) => {
        const IconComponent = section.icon;
        const isExpanded = expandedSections.has(section.id);
        
        return (
          <div key={section.id} className="phase3-sidebar-section">
            <button
              onClick={() => toggleSection(section.id)}
              className="phase3-sidebar-header w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  section.gradient || 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  <IconComponent size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                  <p className="text-xs text-white/70">{section.subtitle}</p>
                </div>
                <div className={`transform transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}>
                  <ChevronDown size={16} className="text-white/60" />
                </div>
              </div>
            </button>
            
            <div className={`phase3-collapsible-content ${
              isExpanded ? 'expanded' : 'collapsed'
            }`}>
              <div className="phase3-sidebar-content">
                {section.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const createSmartFiltersSection = (
  filters: React.ReactNode,
  isExpanded: boolean = true
): SidebarSection => ({
  id: 'smart-filters',
  title: 'Smart Filters',
  subtitle: 'Filter and search',
  icon: Filter,
  content: filters,
  defaultExpanded: isExpanded,
  gradient: 'bg-gradient-to-r from-blue-500 to-purple-500'
});

export const createAIInsightsSection = (
  insights: React.ReactNode,
  isExpanded: boolean = false
): SidebarSection => ({
  id: 'ai-insights',
  title: 'AI Insights',
  subtitle: 'Smart suggestions',
  icon: Sparkles,
  content: insights,
  defaultExpanded: isExpanded,
  gradient: 'bg-gradient-to-r from-green-500 to-blue-500'
});

export default Phase3RightSidebar;