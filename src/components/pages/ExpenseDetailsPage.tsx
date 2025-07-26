'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Calendar, Building, FileText, User, Tag, Download, Edit } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';

const ExpenseDetailsPage = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/expenses/${expenseId}`);
      return data.data;
    },
    enabled: !!expenseId
  });

  const { data: relatedData } = useQuery({
    queryKey: ['expenseRelatedData', expenseId],
    queryFn: async () => {
      const [approvals, maintenance, property] = await Promise.all([
        apiClient.get(`/approvals?expenseId=${expenseId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/maintenance?expenseId=${expenseId}`).catch(() => ({ data: { data: [] } })),
        expense?.propertyId ? apiClient.get(`/properties/${expense.propertyId}`).catch(() => ({ data: { data: null } })) : Promise.resolve({ data: { data: null } })
      ]);

      return {
        approvals: approvals.data.data || [],
        maintenance: maintenance.data.data || [],
        property: property.data.data
      };
    },
    enabled: !!expense
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading expense details...</span>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Expense Not Found</h3>
        <Link href="/dashboard/expenses" className="btn-gradient px-6 py-3 rounded-2xl font-semibold">
          Back to Expenses
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'approvals', label: 'Approvals', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/expenses" className="p-2 rounded-xl hover:bg-app-bg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Expense Details</h1>
            <p className="text-text-secondary">{expense.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <UniversalActionButton variant="success" size="sm" icon={Download}>
            Download Receipt
          </UniversalActionButton>
          <UniversalActionButton variant="primary" icon={Edit}>
            Edit Expense
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
              {/* Expense Information */}
              <UniversalCard gradient="red">
                <h3 className="text-lg font-bold mb-4">Expense Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Amount</p>
                    <p className="text-2xl font-bold text-red-600">${expense.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Category</p>
                    <UniversalStatusBadge status={expense.category} variant="error" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Date</p>
                    <p className="font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Property</p>
                    <p className="font-medium">{relatedData?.property?.name || 'General'}</p>
                  </div>
                </div>
              </UniversalCard>

              {/* Description */}
              <UniversalCard gradient="blue">
                <h3 className="text-lg font-bold mb-4">Description</h3>
                <p className="text-text-secondary">{expense.description}</p>
              </UniversalCard>

              {/* Related Maintenance */}
              {relatedData?.maintenance?.length > 0 && (
                <UniversalCard gradient="orange">
                  <h3 className="text-lg font-bold mb-4">Related Maintenance</h3>
                  <div className="space-y-3">
                    {relatedData.maintenance.map((request: any) => (
                      <div key={request._id} className="p-4 bg-app-bg rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{request.description}</h4>
                            <p className="text-sm text-text-secondary">{new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                          <UniversalStatusBadge 
                            status={request.status}
                            variant={request.status === 'Completed' ? 'success' : 'warning'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </UniversalCard>
              )}
            </div>
          )}

          {activeTab === 'approvals' && (
            <UniversalCard gradient="purple">
              <h3 className="text-lg font-bold mb-4">Approval History</h3>
              <div className="space-y-3">
                {relatedData?.approvals?.map((approval: any) => (
                  <div key={approval._id} className="p-4 bg-app-bg rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{approval.type}</h4>
                        <p className="text-sm text-text-secondary">By: {approval.requestedBy?.name}</p>
                      </div>
                      <UniversalStatusBadge 
                        status={approval.status}
                        variant={approval.status === 'Approved' ? 'success' : approval.status === 'Rejected' ? 'error' : 'warning'}
                      />
                    </div>
                    <p className="text-sm text-text-secondary">{new Date(approval.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </UniversalCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Expense Summary */}
          <UniversalCard gradient="red">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-600">${expense.amount}</h3>
              <p className="text-sm text-text-secondary">{expense.category}</p>
            </div>
          </UniversalCard>

          {/* Property Info */}
          {relatedData?.property && (
            <UniversalCard gradient="blue">
              <h3 className="text-lg font-bold mb-4">Property</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building size={16} className="text-text-muted" />
                  <span className="text-sm">{relatedData.property.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-text-muted" />
                  <span className="text-sm">{relatedData.property.address?.formattedAddress}</span>
                </div>
              </div>
              <Link 
                to={`/dashboard/properties/${relatedData.property._id}`}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors block text-center mt-4"
              >
                View Property
              </Link>
            </UniversalCard>
          )}

          {/* Quick Actions */}
          <UniversalCard gradient="green">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors">
                Mark as Paid
              </button>
              <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors">
                Request Approval
              </button>
              <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors">
                Add to Budget
              </button>
            </div>
          </UniversalCard>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseDetailsPage;