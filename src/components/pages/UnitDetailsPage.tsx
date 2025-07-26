'use client';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, User, DollarSign, Calendar, Receipt, Wrench, FileText, TrendingUp } from 'lucide-react';

const fetchUnitDetails = async (propertyId: string, unitNumber: string) => {
  const { data } = await apiClient.get(`/properties/${propertyId}/units`);
  const unit = data.data.find((u: any) => u.unitNumber === unitNumber);
  if (!unit) throw new Error('Unit not found');
  return unit;
};

const fetchProperty = async (propertyId: string) => {
  const { data } = await apiClient.get(`/properties/${propertyId}`);
  return data.data;
};

const UnitDetailsPage = () => {
  const { propertyId, unitNumber } = useParams<{ propertyId: string; unitNumber: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: unit, isLoading: unitLoading } = useQuery({
    queryKey: ['unit', propertyId, unitNumber],
    queryFn: () => fetchUnitDetails(propertyId!, unitNumber!),
    enabled: !!propertyId && !!unitNumber
  });

  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchProperty(propertyId!),
    enabled: !!propertyId
  });

  if (unitLoading) {
    return (
      <div className="min-h-screen relative" style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)'}}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-pulse"></div>
          <span className="ml-3 text-white">Loading unit details...</span>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen relative" style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)'}}>
        <div className="text-center py-16">
          <h3 className="text-xl font-bold text-white mb-2">Unit Not Found</h3>
          <p className="text-white/80 mb-4">The unit you're looking for doesn't exist.</p>
          <Link
            to={`/dashboard/properties/${propertyId}`}
            className="bg-gradient-to-r from-orange-400 to-blue-400 text-white px-6 py-3 rounded-2xl font-semibold inline-flex items-center gap-2 hover:scale-105 transition-all"
          >
            <ArrowLeft size={20} />
            Back to Property
          </Link>
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
      
      <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 space-y-8"
      >
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
        <div className="relative rounded-3xl p-6 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/dashboard/properties/${propertyId}`}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
              >
                <ArrowLeft size={24} className="text-white" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                  Unit {unit.unitNumber}
                </h1>
                <p className="text-white/90 mt-1">
                  {property?.name || 'Property Details'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl p-4 border border-white/30 mb-6" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', backdropFilter: 'blur(20px)'}}>
        <nav className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'receipts', label: 'Receipts', icon: Receipt },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'documents', label: 'Documents', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white border-2 border-white/50'
                    : 'text-white/80 hover:text-white hover:scale-105'
                }`}
                style={activeTab === tab.id ? {background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)'} : {}}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="rounded-3xl p-8 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
              <h2 className="text-xl font-bold text-white mb-6">Unit Information</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                  <Home size={20} className="text-blue-400" />
                  <div>
                    <p className="text-sm text-white/70">Unit Number</p>
                    <p className="font-medium text-white text-lg">{unit.unitNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                  <DollarSign size={20} className="text-green-400" />
                  <div>
                    <p className="text-sm text-white/70">Current Rent</p>
                    <p className="font-medium text-green-300 text-lg">
                      ${unit.rentAmount || 0}/month
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                  <User size={20} className={unit.isOccupied ? 'text-red-400' : 'text-green-400'} />
                  <div>
                    <p className="text-sm text-white/70">Status</p>
                    <p className={`font-medium text-lg ${unit.isOccupied ? 'text-red-300' : 'text-green-300'}`}>
                      {unit.isOccupied ? 'Occupied' : 'Vacant'}
                    </p>
                  </div>
                </div>

                {unit.tenantName && (
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                    <User size={20} className="text-purple-400" />
                    <div>
                      <p className="text-sm text-white/70">Current Tenant</p>
                      <Link 
                        to={`/dashboard/tenants/${unit.tenantId}`}
                        className="font-medium text-blue-300 hover:text-blue-200 text-lg transition-colors"
                      >
                        {unit.tenantName}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab !== 'overview' && (
            <div className="rounded-3xl p-8 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
              <div className="text-center py-8">
                <p className="text-white/70 mb-4">View {activeTab} data for this unit</p>
                <Link
                  to={`/dashboard/${activeTab}?propertyId=${propertyId}&unit=${unitNumber}`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-semibold"
                >
                  <TrendingUp size={16} />
                  View {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {!unit.isOccupied ? (
                <Link 
                  to={`/dashboard/tenants/add?propertyId=${propertyId}&unit=${unit.unitNumber}`}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:scale-105 transition-all duration-300 block text-center border border-white/20"
                  style={{backdropFilter: 'blur(10px)'}}
                >
                  Add Tenant to Unit
                </Link>
              ) : (
                <Link 
                  to={`/dashboard/tenants/${unit.tenantId}`}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:scale-105 transition-all duration-300 block text-center border border-white/20"
                  style={{backdropFilter: 'blur(10px)'}}
                >
                  View Tenant Details
                </Link>
              )}
              
              <Link 
                to={`/dashboard/payments?propertyId=${propertyId}&unit=${unit.unitNumber}`}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:scale-105 transition-all duration-300 block text-center border border-white/20"
                style={{backdropFilter: 'blur(10px)'}}
              >
                View Unit Payments
              </Link>
              
              <Link 
                to={`/dashboard/receipts?propertyId=${propertyId}&unit=${unit.unitNumber}`}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:scale-105 transition-all duration-300 block text-center border border-white/20"
                style={{backdropFilter: 'blur(10px)'}}
              >
                View Receipts
              </Link>
              
              <Link 
                to={`/dashboard/maintenance?propertyId=${propertyId}&unit=${unit.unitNumber}`}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:scale-105 transition-all duration-300 block text-center border border-white/20"
                style={{backdropFilter: 'blur(10px)'}}
              >
                Unit Maintenance
              </Link>
            </div>
          </div>
        </div>
      </div>
      </motion.div>
      </div>
    </div>
  );
};

export default UnitDetailsPage;