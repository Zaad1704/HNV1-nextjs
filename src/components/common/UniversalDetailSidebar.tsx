import React, { ReactNode } from 'react';
import UniversalGlassyDetailCard from './UniversalGlassyDetailCard';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface TimelineEvent {
  icon: React.ElementType;
  title: string;
  date: string;
  description?: string;
  color?: string;
}

interface RelatedItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  link: string;
}

interface UniversalDetailSidebarProps {
  quickActions?: QuickAction[];
  timeline?: TimelineEvent[];
  relatedItems?: RelatedItem[];
  relatedItemsTitle?: string;
  relatedItemsViewAllLink?: string;
  customContent?: ReactNode;
}

const UniversalDetailSidebar: React.FC<UniversalDetailSidebarProps> = ({
  quickActions = [],
  timeline = [],
  relatedItems = [],
  relatedItemsTitle = 'Related Items',
  relatedItemsViewAllLink,
  customContent
}) => {
  return (
    <>
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
          <div className="relative rounded-3xl p-6 border-2 border-white/40" style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', 
            backdropFilter: 'blur(25px) saturate(200%)'
          }}>
            <h3 className="text-lg font-bold text-white/90 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const bgColor = action.color || 'rgba(59, 130, 246, 0.3)';
                
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    style={{background: bgColor, backdropFilter: 'blur(10px)'}}
                  >
                    <Icon size={18} className="text-white" />
                    <span className="text-white">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <UniversalGlassyDetailCard title="Timeline" gradient="secondary">
          <div className="space-y-4">
            {timeline.map((event, index) => {
              const Icon = event.icon;
              const bgColor = event.color || 'rgba(59, 130, 246, 0.3)';
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: bgColor, backdropFilter: 'blur(10px)'}}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-white/70">{event.date}</p>
                    {event.description && <p className="text-sm text-white/90 mt-1">{event.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </UniversalGlassyDetailCard>
      )}

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <UniversalGlassyDetailCard 
          title={relatedItemsTitle} 
          gradient="primary"
          headerAction={
            relatedItemsViewAllLink && (
              <a href={relatedItemsViewAllLink} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                View All
              </a>
            )
          }
        >
          <div className="space-y-3">
            {relatedItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <a 
                  key={item.id} 
                  href={item.link}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.2)', backdropFilter: 'blur(10px)'}}>
                    <Icon size={20} className="text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.title}</p>
                    {item.subtitle && <p className="text-sm text-white/70">{item.subtitle}</p>}
                  </div>
                </a>
              );
            })}
          </div>
        </UniversalGlassyDetailCard>
      )}

      {/* Custom Content */}
      {customContent}
    </>
  );
};

export default UniversalDetailSidebar;