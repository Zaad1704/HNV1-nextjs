import React from 'react';
import { Building2, Users, DollarSign } from 'lucide-react';

const CardTest = () => {
  return (
    <div className="dashboard-container p-6">
      <h1 className="text-2xl font-bold mb-6">Card Styling Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Regular Card */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="w-12 h-12 bg-blue-500 rounded-xl mb-4 flex items-center justify-center">
            <Building2 size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Regular Card</h3>
          <p className="text-text-secondary">This should have white background</p>
        </div>

        {/* Gradient Card */}
        <div className="gradient-dark-orange-blue rounded-3xl p-6 text-white">
          <div className="w-12 h-12 bg-white/25 rounded-xl mb-4 flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Gradient Card</h3>
          <p className="text-white/80">This should have gradient background</p>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="w-12 h-12 bg-green-500 rounded-xl mb-4 flex items-center justify-center">
            <DollarSign size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Welcome Card</h3>
          <p className="text-text-secondary">This should also have white background</p>
        </div>
      </div>
    </div>
  );
};

export default CardTest;