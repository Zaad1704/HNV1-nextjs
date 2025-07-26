'use client';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, DollarSign, Calendar, MapPin, Phone, Mail, FileText, Wrench, AlertTriangle, Download, Edit, Trash2, Archive, ArchiveRestore, User } from 'lucide-react';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';
import PropertyStyleCard from '@/components/common/PropertyStyleCard';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';

import TenantAnalyticsDashboard from '@/components/tenant/TenantAnalyticsDashboard';
import EditTenantModal from '@/components/common/EditTenantModal';
import QuickPaymentModal from '@/components/common/QuickPaymentModal';

const TenantDetailsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'normal' | 'overdue'>('normal');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}`);
      return data.data;
    },
    enabled: !!tenantId
  });

  // Rest of the component code...

  return (
    <PropertyStyleBackground>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 p-6">
        {/* Component content */}
      </motion.div>
    </PropertyStyleBackground>
  );
};

export default TenantDetailsPage;