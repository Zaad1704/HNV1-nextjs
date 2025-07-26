import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface UniversalTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

const UniversalTabs: React.FC<UniversalTabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-1 flex flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-md'
              : 'text-white/80 hover:text-white hover:bg-white/5'
          }`}
        >
          <tab.icon size={16} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default UniversalTabs;