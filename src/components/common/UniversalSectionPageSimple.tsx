import React, { ReactNode } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UniversalSectionPageSimpleProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  stats: Array<{label: string, value: number | string}>;
  actionWheel: ReactNode;
  addButton: ReactNode;
  floatingActionMenu: ReactNode;
  children: ReactNode;
  activityFeed?: ReactNode;
  isLoading?: boolean;
  error?: any;
  headerContent?: ReactNode;
  rightSidebar?: ReactNode;
}

const UniversalSectionPageSimple: React.FC<UniversalSectionPageSimpleProps> = ({
  title,
  subtitle,
  icon: Icon,
  stats,
  actionWheel,
  addButton,
  floatingActionMenu,
  children,
  activityFeed,
  isLoading,
  error,
  headerContent,
  rightSidebar
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-blue-600/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">Loading {title}</h2>
          <p className="text-gray-300 mb-4">Please wait while we retrieve the data...</p>
        </div>
      </div>
    );
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
            <div className="relative rounded-3xl p-6 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {headerContent || (
                    <div className="w-10 h-10"></div> /* Empty placeholder when no headerContent */
                  )}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                    <Icon size={24} className="text-white" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                      {title}
                      <Sparkles size={24} className="text-yellow-400 animate-pulse" />
                    </h1>
                    <p className="text-white/90" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                      <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{stat.value}</div>
                      <div className="text-xs text-white/80">{stat.label}</div>
                    </div>
                  ))}
                  {actionWheel}
                  {addButton}
                </div>
              </div>
              {headerContent && (
                <div className="mt-4">
                  {headerContent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="rounded-2xl p-4 border border-white/30 mb-4" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                  <Icon size={20} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'}} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{title}</h1>
                  <p className="text-sm text-white/90">{subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {stats.slice(0, 2).map((stat, index) => (
                <div key={index} className="text-center px-2 py-1 rounded-lg flex-1" style={{background: 'rgba(0,0,0,0.2)'}}>
                  <div className="text-sm font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 gap-6">
            {/* Floating Action Menu - Left Corner */}
            <div className="flex justify-start mb-4">
              <div className="relative" style={{zIndex: 100000}}>
                {floatingActionMenu}
              </div>
            </div>

            {/* Main Content with optional right sidebar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                {children}
              </div>
              
              {rightSidebar && (
                <div className="md:col-span-4 space-y-6">
                  {rightSidebar}
                </div>
              )}
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

          {/* Mobile Header Content */}
          {headerContent && (
            <div className="mb-4">
              {headerContent}
            </div>
          )}

          {/* Mobile Content */}
          {children}
          
          {/* Mobile Sidebar */}
          {rightSidebar && (
            <div className="mt-6 space-y-4 p-2 rounded-xl border border-white/20" style={{background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)'}}>
              <h3 className="text-lg font-bold text-white/90 px-2">AI Insights & Suggestions</h3>
              {rightSidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalSectionPageSimple;