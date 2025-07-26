'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ComprehensiveTenantModal from '@/components/common/ComprehensiveTenantModal';

const AddTenantPage = () => {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  
  const propertyId = searchParams.get('propertyId');
  const unit = searchParams.get('unit');

  const handleTenantAdded = (tenant: any) => {
    // Navigate back to appropriate page
    if (propertyId) {
      router.push(`/dashboard/properties/${propertyId}`);
    } else {
      router.push('/dashboard/tenants');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    // Navigate back to previous page
    if (propertyId) {
      router.push(`/dashboard/properties/${propertyId}`);
    } else {
      router.push('/dashboard/tenants');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Tenant</h1>
            <p className="text-gray-600">
              {propertyId && unit 
                ? `Adding tenant to Unit ${unit}` 
                : propertyId 
                ? 'Adding tenant to selected property'
                : 'Add a new tenant to your properties'}
            </p>
          </div>
        </div>

        <ComprehensiveTenantModal
          isOpen={showModal}
          onClose={handleClose}
          onTenantAdded={handleTenantAdded}
        />
      </div>
    </div>
  );
};

export default AddTenantPage;