'use client';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Share2, Download, MessageCircle, Phone, Mail, MapPin, Calendar, DollarSign, FileText, User, AlertTriangle } from 'lucide-react';
import TenantProfileDashboard from '@/components/tenant/TenantProfileDashboard';
import TenantCommunicationLog from '@/components/tenant/TenantCommunicationLog';
import TenantDocumentManager from '@/components/tenant/TenantDocumentManager';
import TenantNotesAndTags from '@/components/tenant/TenantNotesAndTags';
import TenantPaymentTimeline from '@/components/tenant/TenantPaymentTimeline';
import TenantAnalyticsDashboard from '@/components/tenant/TenantAnalyticsDashboard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';

const TenantDetailPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}`);
      return data.data;
    },
    enabled: !!tenantId
  });

  if (isLoading) {
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-spin">
              <div className="w-full h-full rounded-full border-2 border-transparent border-t-white"></div>
            </div>
            <p className="text-white font-medium">Loading tenant details...</p>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  if (!tenant) {
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 rounded-3xl border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <h2 className="text-xl font-semibold text-white mb-2">Tenant not found</h2>
            <p className="text-white/80 mb-4">The tenant you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/dashboard/tenants" className="bg-gradient-to-r from-orange-400 to-blue-400 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all">
              ← Back to Tenants
            </Link>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'analytics', label: 'Analytics', count: null },
    { id: 'payments', label: 'Payments', count: 24 },
    { id: 'communication', label: 'Messages', count: 12 },
    { id: 'documents', label: 'Documents', count: 8 },
    { id: 'notes', label: 'Notes', count: 5 }
  ];

  return (
    <PropertyStyleBackground>
      <div className="space-y-8 p-6">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 border-b border-white/30 lg:hidden" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', borderColor: 'rgba(255, 255, 255, 0.3)'}}>
          <div className="flex items-center justify-between p-4">
            <Link 
              to="/dashboard/tenants"
              className="p-2 rounded-xl transition-colors" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
            >
              <ArrowLeft size={20} className="text-white" />
            </Link>
            <div className="flex-1 mx-4">
              <h1 className="text-lg font-bold text-white truncate" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{tenant.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-white rounded-xl transition-colors" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
              >
                <Edit size={16} />
              </button>
              <button
                className="p-2 text-white rounded-xl transition-colors" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="5" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="19" r="2" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
              <div className="relative rounded-3xl p-6 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Link 
                      to="/dashboard/tenants"
                      className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                    >
                      <ArrowLeft size={20} className="text-white" />
                    </Link>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{tenant.name}</h1>
                      <div className="flex items-center gap-2 text-white/90 mt-1">
                        <MapPin size={16} />
                        <span>Unit {tenant.unit} • {tenant.propertyId?.name}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-xl hover:scale-105 transition-all duration-300 border border-white/40"
                    style={{backdropFilter: 'blur(20px)'}}
                  >
                    <Edit size={16} />
                    Edit Tenant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Address */}
          <div className="lg:hidden mb-4 mx-4 p-3 rounded-xl border border-white/30" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin size={14} />
              <span className="text-sm">Unit {tenant.unit} • {tenant.propertyId?.name}</span>
            </div>
          </div>

          {/* Navigation Tabs - Styled like Property Page */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 p-1 rounded-2xl" style={{background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)'}}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 min-w-max ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-lg scale-105'
                      : 'text-white/80 hover:bg-white/10 active:bg-white/20'
                  }`}
                >
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.count && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/80'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4 lg:space-y-8 order-2 lg:order-1">
              {/* Tab Content - Styled with Glass Morphism */}
              <div className="rounded-3xl border border-white/30 p-6" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(15px)'}}>
                {activeTab === 'overview' && (
                  <div className="space-y-4 md:space-y-6">
                    <TenantProfileDashboard tenantId={tenantId!} className="glass-morphism" />
                  </div>
                )}
                
                {activeTab === 'analytics' && (
                  <div className="space-y-4 md:space-y-6">
                    <TenantAnalyticsDashboard tenantId={tenantId!} className="glass-morphism" />
                  </div>
                )}
                
                {activeTab === 'payments' && (
                  <div className="space-y-4 md:space-y-6">
                    <TenantPaymentTimeline tenantId={tenantId!} className="glass-morphism" />
                  </div>
                )}
                
                {activeTab === 'communication' && (
                  <div className="space-y-4 md:space-y-6">
                    <TenantCommunicationLog 
                      tenantId={tenantId!} 
                      tenantName={tenant.name}
                      className="glass-morphism"
                    />
                  </div>
                )}
                
                {activeTab === 'documents' && (
                  <div className="space-y-4 md:space-y-6">
                    <TenantDocumentManager 
                      tenantId={tenantId!} 
                      tenantName={tenant.name}
                      className="glass-morphism"
                    />
                  </div>
                )}
                
                {activeTab === 'notes' && (
                  <div className="space-y-4 md:space-y-6">
                    <TenantNotesAndTags 
                      tenantId={tenantId!} 
                      tenantName={tenant.name}
                      className="glass-morphism"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Quick Actions */}
            <div className="order-1 lg:order-2">
              {/* Tenant Overview Card */}
              <div className="space-y-4 lg:space-y-6">
                {/* Tenant Overview Card */}
                <div className="rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">Tenant Overview</h3>
                  
                  {/* Tenant Image */}
                  <div className="mb-3 lg:mb-4 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                      {tenant.imageUrl ? (
                        <img
                          src={tenant.imageUrl}
                          alt={tenant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 lg:space-y-3 lg:block">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <span className="text-xs lg:text-sm text-white/80">Status</span>
                      <span className="font-medium text-sm lg:text-base text-white">{tenant.status || 'Active'}</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <span className="text-xs lg:text-sm text-white/80">Unit</span>
                      <span className="font-medium text-sm lg:text-base text-white">{tenant.unit}</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <span className="text-xs lg:text-sm text-white/80">Since</span>
                      <span className="font-medium text-sm lg:text-base text-white">
                        {new Date(tenant.leaseStartDate || tenant.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between col-span-2 lg:col-span-1">
                      <span className="text-xs lg:text-sm text-white/80">Monthly Rent</span>
                      <span className="font-medium text-sm lg:text-base text-green-300">
                        ${tenant.rentAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Actions Wheel */}
                <div className="rounded-3xl p-6 border-2 border-white/30 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)'}}>
                  <h3 className="text-lg font-bold text-white mb-6 text-center">Quick Actions</h3>
                  <div className="relative flex items-center justify-center">
                    {/* Center circle */}
                    <div className="absolute w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                      <span className="text-white text-xs font-bold">Actions</span>
                    </div>
                    
                    {/* Action buttons in wheel formation */}
                    <div className="relative w-48 h-48">
                      <button 
                        onClick={() => window.open(`tel:${tenant.phone}`)}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-20 h-20 rounded-full border-2 border-green-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                        style={{background: 'rgba(34, 197, 94, 0.4)', backdropFilter: 'blur(10px)'}}>
                        <Phone size={20} className="mb-1" />
                        <span className="text-xs font-bold">Call</span>
                      </button>

                      <button 
                        onClick={() => window.open(`mailto:${tenant.email}`)}
                        className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-blue-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                        style={{background: 'rgba(59, 130, 246, 0.4)', backdropFilter: 'blur(10px)'}}>
                        <Mail size={20} className="mb-1" />
                        <span className="text-xs font-bold">Email</span>
                      </button>

                      <button 
                        onClick={() => alert('Messaging feature coming soon')}
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-20 h-20 rounded-full border-2 border-purple-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                        style={{background: 'rgba(168, 85, 247, 0.4)', backdropFilter: 'blur(10px)'}}>
                        <MessageCircle size={20} className="mb-1" />
                        <span className="text-xs font-bold">Message</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Management Wheel */}
                <div className="rounded-3xl p-6 border-2 border-white/30 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)'}}>
                  <h3 className="text-lg font-bold text-white mb-6 text-center">Management</h3>
                  <div className="relative flex items-center justify-center">
                    {/* Center circle */}
                    <div className="absolute w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                      <span className="text-white text-xs font-bold">Manage</span>
                    </div>
                    
                    {/* Management buttons in wheel formation */}
                    <div className="relative w-52 h-52">
                      <button
                        onClick={() => setActiveTab('payments')}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-18 h-18 rounded-full border-2 border-indigo-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                        style={{background: 'rgba(99, 102, 241, 0.4)', backdropFilter: 'blur(10px)'}}>
                        <DollarSign size={16} className="mb-1" />
                        <span className="text-xs font-bold">Payments</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('documents')}
                        className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 w-18 h-18 rounded-full border-2 border-orange-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                        style={{background: 'rgba(249, 115, 22, 0.4)', backdropFilter: 'blur(10px)'}}>
                        <FileText size={16} className="mb-1" />
                        <span className="text-xs font-bold">Docs</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('notes')}
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-18 h-18 rounded-full border-2 border-yellow-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                        style={{background: 'rgba(245, 158, 11, 0.4)', backdropFilter: 'blur(10px)'}}>
                        <Edit size={16} className="mb-1" />
                        <span className="text-xs font-bold">Notes</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('communication')}
                        className="absolute top-1/2 left-0 transform -translate-x-2 -translate-y-1/2 w-18 h-18 rounded-full border-2 border-teal-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                        style={{background: 'rgba(20, 184, 166, 0.4)', backdropFilter: 'blur(10px)'}}>
                        <MessageCircle size={16} className="mb-1" />
                        <span className="text-xs font-bold">Msgs</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-3xl p-6 border-2 border-red-400/60 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)', boxShadow: '0 0 30px rgba(220, 38, 38, 0.2)'}}>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"></div>
                  <div className="relative">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-center gap-2">
                      <AlertTriangle size={20} className="animate-bounce text-red-300" />
                      <span className="bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">Danger Zone</span>
                    </h3>
                    
                    <div className="relative flex items-center justify-center">
                      {/* Center warning */}
                      <div className="absolute w-16 h-16 rounded-full border-2 border-red-400/50 flex items-center justify-center" style={{background: 'rgba(220, 38, 38, 0.3)'}}>
                        <AlertTriangle size={20} className="text-red-300" />
                      </div>
                      
                      {/* Danger buttons - Well separated for safety */}
                      <div className="space-y-12">
                        {/* Archive Section */}
                        <div className="p-4 rounded-2xl border border-yellow-400/30" style={{background: 'rgba(234, 179, 8, 0.1)'}}>
                          <div className="text-center mb-4">
                            <h4 className="text-sm font-bold text-yellow-300 mb-2">SAFE ACTION</h4>
                            <p className="text-xs text-yellow-200">Mark tenant as inactive</p>
                          </div>
                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                if (confirm(`Mark ${tenant.name} as inactive? This will preserve all data.`)) {
                                  alert('Status change functionality coming soon');
                                }
                              }}
                              className="w-28 h-28 rounded-full border-2 border-yellow-400/60 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center text-white group"
                              style={{background: 'rgba(234, 179, 8, 0.3)', backdropFilter: 'blur(10px)'}}>
                              <User size={20} className="mb-2 group-hover:animate-bounce" />
                              <span className="text-sm font-bold">Inactive</span>
                              <span className="text-xs text-yellow-200">Reversible</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Bottom Navigation Spacer */}
        <div className="h-20 md:hidden"></div>
      </div>
    </PropertyStyleBackground>
  );
};

export default TenantDetailPage;

// Add this CSS to your global styles or component-specific styles
// @keyframes gradientFlow {
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// }