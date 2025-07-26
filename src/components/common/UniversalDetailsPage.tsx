import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface UniversalDetailsPageProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  stats: Array<{label: string, value: number | string}>;
  actionWheel: ReactNode;
  backLink: string;
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  sidebarContent?: ReactNode;
  isLoading?: boolean;
  error?: any;
}

const UniversalDetailsPage: React.FC<UniversalDetailsPageProps> = ({
  title,
  subtitle,
  icon: Icon,
  stats,
  actionWheel,
  backLink,
  backLabel = 'Back',
  onBack,
  children,
  tabs = [],
  activeTab = '',
  onTabChange = () => {},
  sidebarContent,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-spin">
            <div className="w-full h-full rounded-full border-2 border-transparent border-t-white"></div>
          </div>
          <p className="text-white text-xl font-medium">Loading {title}...</p>
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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen relative" 
      style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)'}}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{backgroundColor: '#FF6B35', opacity: 0.4}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: '#1E88E5', opacity: 0.4}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" style={{backgroundColor: '#43A047', opacity: 0.3}}></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={onBack || (() => {})}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
        </div>

        {/* Header */}
        <div className="relative mb-8 mt-12">
          <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
          <div className="relative rounded-3xl p-6 border-2 border-white/40" style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', 
            backdropFilter: 'blur(25px) saturate(200%)',
            WebkitBackdropFilter: 'blur(25px) saturate(200%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="border-b border-white/20">
            <nav className="flex space-x-4 px-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === tab.id ? 'bg-blue-500/30' : 'bg-white/10'}`}>
                      <TabIcon size={16} className="text-white" />
                    </div>
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2">
            {children}
          </div>

          {/* Sidebar */}
          {sidebarContent && (
            <div className="space-y-6">
              {sidebarContent}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UniversalDetailsPage;