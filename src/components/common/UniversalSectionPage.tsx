import React, { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import BlendedAIInsightsWidget from '@/components/property/BlendedAIInsightsWidget';
import GlassySmartSuggestionsPanel from '@/components/property/GlassySmartSuggestionsPanel';

interface UniversalSectionPageProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  stats: Array<{label: string, value: number | string}>;
  actionWheel: ReactNode;
  addButton: ReactNode;
  floatingActionMenu: ReactNode;
  children: ReactNode;
  aiInsightsData: {properties: any[], tenants: any[]};
  smartSuggestionsData: {properties: any[], tenants: any[]};
  activityFeed?: ReactNode;
  isLoading?: boolean;
  error?: any;
}

const UniversalSectionPage: React.FC<UniversalSectionPageProps> = ({
  title,
  subtitle,
  icon: Icon,
  stats,
  actionWheel,
  addButton,
  floatingActionMenu,
  children,
  aiInsightsData,
  smartSuggestionsData,
  activityFeed,
  isLoading,
  error
}) => {
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-red-600/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">Unable to Load {title}</h2>
          <p className="text-gray-300 mb-4">We're having trouble connecting to our servers.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-xl font-semibold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)'}}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{backgroundColor: '#FF6B35', opacity: 0.4}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: '#1E88E5', opacity: 0.4}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" style={{backgroundColor: '#43A047', opacity: 0.3}}></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Real-time Activity Feed */}
        {activityFeed}

        {/* Desktop Header - Match Page Background */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
            <div className="relative rounded-3xl p-4 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Icon size={20} className="text-white" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{title}</h1>
                    <div className="flex items-center gap-2 text-white/90 mt-1">
                      <span>{subtitle}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center px-3 py-1 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                      <p className="text-xs text-white/70">{stat.label}</p>
                      <p className="font-medium text-white text-sm">{stat.value}</p>
                    </div>
                  ))}
                  {addButton}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="rounded-2xl p-3 border border-white/30 mb-4" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-white" />
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{title}</h1>
                  <p className="text-sm text-white/90">{subtitle}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center px-2 py-1 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                    <div className="text-xs text-white/70">{stat.label}</div>
                    <div className="text-sm font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="phase3-desktop-layout">
            <div className="phase3-main-content space-y-6">
              {/* Floating Action Menu - Left Corner */}
              <div className="flex justify-start mb-4">
                <div className="relative" style={{zIndex: 100000}}>
                  {floatingActionMenu}
                </div>
              </div>

              {/* Main Content */}
              {children}
            </div>
            
            {/* Right Sidebar with Always Visible AI Insights and Smart Suggestions */}
            <div className="phase3-sidebar space-y-6">
              <BlendedAIInsightsWidget 
                properties={aiInsightsData.properties}
                tenants={aiInsightsData.tenants}
              />
              <GlassySmartSuggestionsPanel 
                properties={smartSuggestionsData.properties} 
                tenants={smartSuggestionsData.tenants} 
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          <div className="px-4 flex justify-start mb-4">
            <div className="relative" style={{zIndex: 100000}}>
              {floatingActionMenu}
            </div>
          </div>

          {/* Mobile Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default UniversalSectionPage;