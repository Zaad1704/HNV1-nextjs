import React from 'react';
import Link from 'next/link';
import { Building2, Plus, Settings, Users, DollarSign } from 'lucide-react';

const EmptyDashboard = () => {
  return (
    <div className="dashboard-container min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Building2 size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Welcome to HNV</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Your complete property management solution. Let's get you started with your first property.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/dashboard/properties" className="group">
            <div className="app-surface rounded-3xl p-8 border border-app-border hover:shadow-app-lg transition-all group-hover:border-brand-blue" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Building2 size={24} className="text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Add Properties</h3>
              <p className="text-text-secondary text-sm">Start by adding your rental properties to track and manage them effectively.</p>
            </div>
          </Link>

          <Link to="/dashboard/tenants" className="group">
            <div className="app-surface rounded-3xl p-8 border border-app-border hover:shadow-app-lg transition-all group-hover:border-brand-orange" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                <Users size={24} className="text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Manage Tenants</h3>
              <p className="text-text-secondary text-sm">Add tenants, track leases, and manage tenant communications.</p>
            </div>
          </Link>

          <Link to="/dashboard/payments" className="group">
            <div className="app-surface rounded-3xl p-8 border border-app-border hover:shadow-app-lg transition-all group-hover:border-green-500" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                <DollarSign size={24} className="text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Track Payments</h3>
              <p className="text-text-secondary text-sm">Monitor rent payments and maintain financial records.</p>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <Link
            to="/dashboard/properties"
            className="btn-gradient py-4 px-8 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 mx-auto max-w-sm"
          >
            <Plus size={24} />
            Get Started
          </Link>
          <p className="text-text-muted text-sm mt-4">Takes less than 2 minutes to set up</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyDashboard;