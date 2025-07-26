import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Users, DollarSign, Settings, Eye, Shield, MessageCircle, FileText, Calendar, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface RoleBasedDashboardProps {
  stats: any;
}

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ stats }) => {
  const { user } = useAuthStore();

  if (user?.role === 'Tenant') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tenant Portal Welcome */}
        <motion.div 
          className="gradient-dark-orange-blue rounded-3xl p-8 md:col-span-2 lg:col-span-2 text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center mb-6">
              <Users size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Tenant Portal</h1>
            <p className="text-white/90 mb-6">Welcome to your personal tenant dashboard. Access your lease information, payment history, and submit maintenance requests.</p>
            <div className="flex gap-3">
              <Link href="/dashboard/payments" className="bg-white text-brand-orange font-bold py-3 px-6 rounded-2xl hover:shadow-lg transition-all">
                View Payments
              </Link>
              <Link href="/dashboard/maintenance" className="bg-white/20 text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all">
                Maintenance
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-4 flex items-center justify-center">
            <DollarSign size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Payment Status</h3>
          <p className="text-text-secondary text-sm mb-4">Current month payment status</p>
          <Link href="/dashboard/payments" className="text-green-600 font-semibold hover:underline">
            View Payment History →
          </Link>
        </motion.div>

        {/* Maintenance Requests */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-4 flex items-center justify-center">
            <Settings size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Maintenance</h3>
          <p className="text-text-secondary text-sm mb-4">Submit and track maintenance requests</p>
          <Link href="/dashboard/maintenance" className="text-orange-600 font-semibold hover:underline">
            Submit Request →
          </Link>
        </motion.div>

        {/* Lease Information */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center">
            <FileText size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Lease Info</h3>
          <p className="text-text-secondary text-sm mb-4">View your lease details and documents</p>
          <Link href="/dashboard/tenants" className="text-blue-600 font-semibold hover:underline">
            View Details →
          </Link>
        </motion.div>

        {/* Contact Landlord */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-4 flex items-center justify-center">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Contact</h3>
          <p className="text-text-secondary text-sm mb-4">Get in touch with your property manager</p>
          <button className="text-purple-600 font-semibold hover:underline">
            Send Message →
          </button>
        </motion.div>
      </div>
    );
  }

  if (user?.role === 'Agent') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Agent Dashboard Welcome */}
        <motion.div 
          className="gradient-dark-orange-blue rounded-3xl p-8 md:col-span-2 lg:col-span-2 text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white/25 rounded-2xl flex items-center justify-center">
                <Eye size={32} className="text-white" />
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Agent Portal
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Agent Dashboard</h1>
            <p className="text-white/90 mb-6">Manage your assigned properties, tenants, and daily operations. You have access to {user?.managedProperties?.length || 0} properties.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-white/80 text-sm">Assigned Properties</p>
                <p className="text-2xl font-bold">{user?.managedProperties?.length || 0}</p>
              </div>
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-white/80 text-sm">Active Tenants</p>
                <p className="text-2xl font-bold">{stats?.totalTenants || 0}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/properties" className="bg-white text-brand-orange font-bold py-3 px-6 rounded-2xl hover:shadow-lg transition-all">
                My Properties
              </Link>
              <Link href="/dashboard/tenants" className="bg-white/20 text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all">
                My Tenants
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Monthly Collections */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-4 flex items-center justify-center">
            <DollarSign size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Collections</h3>
          <p className="text-2xl font-bold text-green-600 mb-2">${stats?.monthlyRevenue?.toLocaleString() || 0}</p>
          <p className="text-text-secondary text-sm mb-4">This month's collections</p>
          <Link href="/dashboard/payments" className="text-green-600 font-semibold hover:underline">
            Record Payment →
          </Link>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-4 flex items-center justify-center">
            <Bell size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Approvals</h3>
          <p className="text-text-secondary text-sm mb-4">Requests pending landlord approval</p>
          <Link href="/dashboard/approvals" className="text-orange-600 font-semibold hover:underline">
            View Requests →
          </Link>
        </motion.div>

        {/* Daily Handover */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6 md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Daily Handover</h3>
              <p className="text-text-secondary text-sm">Submit your daily collection report</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-blue-800 text-sm mb-3">
              Submit your daily collection report with proof of payments received and any issues encountered.
            </p>
            <Link href="/dashboard/agent-handover" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Submit Handover
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="app-surface border border-app-border rounded-3xl p-6 md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/payments" className="bg-green-100 text-green-800 p-3 rounded-xl text-center hover:bg-green-200 transition-colors">
              <DollarSign size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Record Payment</span>
            </Link>
            <Link href="/dashboard/maintenance" className="bg-orange-100 text-orange-800 p-3 rounded-xl text-center hover:bg-orange-200 transition-colors">
              <Settings size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Maintenance</span>
            </Link>
            <Link href="/dashboard/tenants" className="bg-blue-100 text-blue-800 p-3 rounded-xl text-center hover:bg-blue-200 transition-colors">
              <Users size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Add Tenant</span>
            </Link>
            <Link href="/dashboard/properties" className="bg-purple-100 text-purple-800 p-3 rounded-xl text-center hover:bg-purple-200 transition-colors">
              <Building2 size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">View Properties</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default Landlord Dashboard (existing layout)
  return null;
};

export default RoleBasedDashboard;