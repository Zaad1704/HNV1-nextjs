import React from 'react';

const ColorDebug: React.FC = () => {
  const [showDebug, setShowDebug] = React.useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 z-50 bg-red-500 text-white px-3 py-1 rounded text-xs"
        style={{ fontSize: '10px' }}
      >
        Debug Colors
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Color Debug</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--app-bg)' }}></div>
          <span>--app-bg: {getComputedStyle(document.documentElement).getPropertyValue('--app-bg')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--app-surface)' }}></div>
          <span>--app-surface: {getComputedStyle(document.documentElement).getPropertyValue('--app-surface')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--brand-blue)' }}></div>
          <span>--brand-blue: {getComputedStyle(document.documentElement).getPropertyValue('--brand-blue')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--brand-orange)' }}></div>
          <span>--brand-orange: {getComputedStyle(document.documentElement).getPropertyValue('--brand-orange')}</span>
        </div>
        
        <div className="mt-2 p-2 rounded" style={{ background: 'linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-blue) 100%)' }}>
          <span className="text-white text-xs">Gradient Test</span>
        </div>
      </div>
    </div>
  );
};

export default ColorDebug;