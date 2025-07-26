'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Wrench, Calendar, Building, User, DollarSign, Camera, FileText, Download, Edit } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';

const MaintenanceDetailsPage = () => {
  const { maintenanceId } = useParams<{ maintenanceId: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: maintenance, isLoading } = useQuery({
    queryKey: ['maintenance', maintenanceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/maintenance/${maintenanceId}`);
      return data.data;
    },
    enabled: !!maintenanceId
  });

  const { data: relatedData } = useQuery({
    queryKey: ['maintenanceRelatedData', maintenanceId],
    queryFn: async () => {
      const [expenses, approvals, property] = await Promise.all([
        apiClient.get(`/expenses?maintenanceId=${maintenanceId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/approvals?maintenanceId=${maintenanceId}`).catch(() => ({ data: { data: [] } })),
        maintenance?.propertyId ? apiClient.get(`/properties/${maintenance.propertyId}`).catch(() => ({ data: { data: null } })) : Promise.resolve({ data: { data: null } })
      ]);

      return {
        expenses: expenses.data.data || [],
        approvals: approvals.data.data || [],
        property: property.data.data
      };
    },
    enabled: !!maintenance
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading maintenance details...</span>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Maintenance Request Not Found</h3>
        <Link href="/dashboard/maintenance" className="btn-gradient px-6 py-3 rounded-2xl font-semibold">
          Back to Maintenance
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wrench },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'timeline', label: 'Timeline', icon: Calendar }
  ];

  const totalExpenses = relatedData?.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/maintenance" className="p-2 rounded-xl hover:bg-app-bg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Maintenance Request</h1>
            <p className="text-text-secondary">{maintenance.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <UniversalActionButton variant="success" size="sm" icon={Download}>
            Download Report
          </UniversalActionButton>
          <UniversalActionButton variant="primary" icon={Edit}>
            Update Status
          </UniversalActionButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-app-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Request Information */}
              <UniversalCard gradient="blue">
                <h3 className="text-lg font-bold mb-4">Request Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-text-secondary">Description</p>
                    <p className="font-medium">{maintenance.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary">Status</p>
                      <UniversalStatusBadge 
                        status={maintenance.status}
                        variant={maintenance.status === 'Completed' ? 'success' : maintenance.status === 'In Progress' ? 'warning' : 'info'}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Priority</p>
                      <UniversalStatusBadge 
                        status={maintenance.priority || 'Medium'}
                        variant={maintenance.priority === 'High' ? 'error' : maintenance.priority === 'Low' ? 'success' : 'warning'}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Created Date</p>
                      <p className="font-medium">{new Date(maintenance.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Requested By</p>
                      <p className="font-medium">{maintenance.requestedBy?.name || 'System'}</p>
                    </div>
                  </div>
                </div>
              </UniversalCard>

              {/* Cost Summary */}
              <UniversalCard gradient="red">
                <h3 className="text-lg font-bold mb-4">Cost Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">${maintenance.estimatedCost || 0}</p>
                    <p className="text-sm text-blue-800">Estimated</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-2xl font-bold text-red-600">${totalExpenses}</p>
                    <p className="text-sm text-red-800">Actual</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">${(maintenance.estimatedCost || 0) - totalExpenses}</p>
                    <p className="text-sm text-green-800">Difference</p>
                  </div>
                </div>
              </UniversalCard>
            </div>
          )}

          {activeTab === 'expenses' && (
            <UniversalCard gradient="red">
              <h3 className="text-lg font-bold mb-4">Related Expenses</h3>
              <div className="space-y-3">
                {relatedData?.expenses?.map((expense: any) => (
                  <div key={expense._id} className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-text-secondary">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-red-600">${expense.amount}</p>
                  </div>
                ))}
                {(!relatedData?.expenses || relatedData.expenses.length === 0) && (
                  <p className="text-text-secondary text-center py-8">No expenses recorded yet</p>
                )}
              </div>
            </UniversalCard>
          )}

          {activeTab === 'photos' && (
            <UniversalCard gradient="purple">
              <h3 className="text-lg font-bold mb-4">Photos & Documentation</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Placeholder for photos */}
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <Camera size={32} className="text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <Camera size={32} className="text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <Camera size={32} className="text-gray-400" />
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                Upload Photos
              </button>
            </UniversalCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <UniversalCard gradient="blue">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench size={32} className="text-white" />
              </div>
              <UniversalStatusBadge 
                status={maintenance.status}
                variant={maintenance.status === 'Completed' ? 'success' : maintenance.status === 'In Progress' ? 'warning' : 'info'}
                size="lg"
              />
            </div>
          </UniversalCard>

          {/* Property Info */}
          {relatedData?.property && (
            <UniversalCard gradient="green">
              <h3 className="text-lg font-bold mb-4">Property</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building size={16} className="text-text-muted" />
                  <span className="text-sm">{relatedData.property.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User size={16} className="text-text-muted" />
                  <span className="text-sm">Unit {maintenance.unitNumber || 'N/A'}</span>
                </div>
              </div>
              <Link 
                to={`/dashboard/properties/${relatedData.property._id}`}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors block text-center mt-4"
              >
                View Property
              </Link>
            </UniversalCard>
          )}

          {/* Quick Actions */}
          <UniversalCard gradient="orange">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors">
                Mark Complete
              </button>
              <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors">
                Add Expense
              </button>
              <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors">
                Schedule Follow-up
              </button>
            </div>
          </UniversalCard>
        </div>
      </div>
    </motion.div>
  );
};

export default MaintenanceDetailsPage;