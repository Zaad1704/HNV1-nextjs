import React, { useState, useEffect } from 'react';
import { X, Upload, User, Phone, Mail, MapPin, CreditCard, Users, Camera, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  onTenantUpdated: (tenant: any) => void;
}

const EditTenantModal: React.FC<EditTenantModalProps> = ({ isOpen, onClose, tenant, onTenantUpdated }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    propertyId: '',
    unit: '',
    rentAmount: '',
    leaseStartDate: '',
    leaseEndDate: '',
    leaseDuration: '12',
    securityDeposit: '',
    advanceRent: '',
    status: 'Active',
    
    // Personal Details
    fatherName: '',
    motherName: '',
    presentAddress: '',
    permanentAddress: '',
    govtIdNumber: '',
    
    // Reference
    referenceName: '',
    referencePhone: '',
    referenceEmail: '',
    referenceAddress: '',
    referenceRelation: '',
    referenceGovtId: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Additional Details
    occupation: '',
    monthlyIncome: '',
    previousAddress: '',
    reasonForMoving: '',
    petDetails: '',
    vehicleDetails: '',
    specialInstructions: '',
    numberOfOccupants: 1
  });
  
  const [images, setImages] = useState({
    tenantImage: null as File | null,
    govtIdFront: null as File | null,
    govtIdBack: null as File | null
  });
  
  const [additionalAdults, setAdditionalAdults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isAgent = user?.role === 'Agent';
  const canEditDirectly = user?.role === 'Landlord' || user?.role === 'Super Admin';

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tenants');
      return data.data || [];
    },
    enabled: isOpen
  });

  useEffect(() => {
    if (tenant && isOpen) {
      setFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        whatsappNumber: tenant.whatsappNumber || '',
        propertyId: tenant.propertyId?._id || tenant.propertyId || '',
        unit: tenant.unit || '',
        rentAmount: tenant.rentAmount?.toString() || '',
        leaseStartDate: tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toISOString().split('T')[0] : '',
        leaseEndDate: tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toISOString().split('T')[0] : '',
        leaseDuration: tenant.leaseDuration?.toString() || '12',
        securityDeposit: tenant.securityDeposit?.toString() || '',
        advanceRent: tenant.advanceRent?.toString() || '',
        status: tenant.status || 'Active',
        fatherName: tenant.fatherName || '',
        motherName: tenant.motherName || '',
        presentAddress: tenant.presentAddress || '',
        permanentAddress: tenant.permanentAddress || '',
        govtIdNumber: tenant.govtIdNumber || '',
        referenceName: tenant.reference?.name || tenant.referenceName || '',
        referencePhone: tenant.reference?.phone || tenant.referencePhone || '',
        referenceEmail: tenant.reference?.email || tenant.referenceEmail || '',
        referenceAddress: tenant.reference?.address || tenant.referenceAddress || '',
        referenceRelation: tenant.reference?.relation || tenant.referenceRelation || '',
        referenceGovtId: tenant.reference?.govtIdNumber || tenant.referenceGovtId || '',
        emergencyContactName: tenant.emergencyContact?.name || tenant.emergencyContactName || '',
        emergencyContactPhone: tenant.emergencyContact?.phone || tenant.emergencyContactPhone || '',
        emergencyContactRelation: tenant.emergencyContact?.relation || tenant.emergencyContactRelation || '',
        occupation: tenant.occupation || '',
        monthlyIncome: tenant.monthlyIncome?.toString() || '',
        previousAddress: tenant.previousAddress || '',
        reasonForMoving: tenant.reasonForMoving || '',
        petDetails: tenant.petDetails || '',
        vehicleDetails: tenant.vehicleDetails || '',
        specialInstructions: tenant.specialInstructions || '',
        numberOfOccupants: tenant.numberOfOccupants || 1
      });
      
      setAdditionalAdults(tenant.additionalAdults || []);
    }
  }, [tenant, isOpen]);

  const handleImageUpload = (field: string, file: File) => {
    setImages(prev => ({ ...prev, [field]: file }));
  };
  
  const addAdditionalAdult = () => {
    setAdditionalAdults(prev => [...prev, {
      name: '',
      phone: '',
      fatherName: '',
      motherName: '',
      permanentAddress: '',
      govtIdNumber: '',
      relation: '',
      image: null
    }]);
  };
  
  const removeAdditionalAdult = (index: number) => {
    setAdditionalAdults(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateAdditionalAdult = (index: number, field: string, value: any) => {
    setAdditionalAdults(prev => prev.map((adult, i) => 
      i === index ? { ...adult, [field]: value } : adult
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const submitData = new FormData();
      
      // Add basic form data
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value !== null && value !== undefined && value !== '') {
          submitData.append(key, String(value));
        }
      });
      
      // Add images if uploaded
      if (images.tenantImage) {
        submitData.append('tenantImage', images.tenantImage);
      }
      if (images.govtIdFront) {
        submitData.append('govtIdFront', images.govtIdFront);
      }
      if (images.govtIdBack) {
        submitData.append('govtIdBack', images.govtIdBack);
      }
      
      // Add additional adults
      if (additionalAdults.length > 0) {
        const adultsData = additionalAdults.map((adult, index) => {
          const adultData = { ...adult };
          delete adultData.image;
          delete adultData.govtIdImage;
          return adultData;
        });
        submitData.append('additionalAdults', JSON.stringify(adultsData));
        
        additionalAdults.forEach((adult, index) => {
          if (adult.image) {
            submitData.append(`additionalAdultImage_${index}`, adult.image);
          }
          if (adult.govtIdImage) {
            submitData.append(`additionalAdultGovtId_${index}`, adult.govtIdImage);
          }
        });
      }
      
      let response;
      if (isAgent) {
        // Submit for approval
        response = await apiClient.post('/edit-requests', {
          type: 'tenant',
          entityId: tenant._id,
          changes: Object.fromEntries(submitData.entries()),
          reason: 'Tenant information update'
        });
        alert('Edit request submitted for approval!');
      } else {
        // Direct update
        response = await apiClient.put(`/tenants/${tenant._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Tenant updated successfully!');
        onTenantUpdated(response.data.data);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Update tenant error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update tenant';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedProperty = properties.find(p => p._id === formData.propertyId);
  const isCommercial = selectedProperty?.propertyType === 'Commercial';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Tenant: {tenant?.name}
            </h3>
            <p className="text-gray-600 mt-1">Update tenant information and lease details</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <X size={24} className="text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}
          
          {isAgent && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Approval Required</p>
                <p className="text-yellow-700 text-sm mt-1">
                  As an agent, your changes will be submitted for landlord approval.
                </p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                <p className="text-sm text-gray-600">Personal details and contact information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Late">Late Payment</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property & Lease Details */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Property & Lease Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property *</label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map((property: any) => (
                    <option key={property._id} value={property._id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent *</label>
                <input
                  type="number"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lease Start Date</label>
                <input
                  type="date"
                  value={formData.leaseStartDate}
                  onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lease End Date</label>
                <input
                  type="date"
                  value={formData.leaseEndDate}
                  onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Government ID Number</label>
                <input
                  type="text"
                  value={formData.govtIdNumber}
                  onChange={(e) => setFormData({ ...formData, govtIdNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Present Address</label>
                <textarea
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income</label>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Occupants</label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfOccupants}
                  onChange={(e) => setFormData({ ...formData, numberOfOccupants: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Details</label>
                <input
                  type="text"
                  value={formData.vehicleDetails}
                  onChange={(e) => setFormData({ ...formData, vehicleDetails: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Car - ABC123, Bike - XYZ789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Details</label>
                <input
                  type="text"
                  value={formData.petDetails}
                  onChange={(e) => setFormData({ ...formData, petDetails: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1 Dog, 2 Cats"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions/Notes</label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any special requirements, medical conditions, or important notes..."
              />
            </div>
          </div>

          {/* Additional Adults */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Additional Adults</h4>
              <button
                type="button"
                onClick={addAdditionalAdult}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Add Adult
              </button>
            </div>
            
            {additionalAdults.map((adult, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium">Adult {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeAdditionalAdult(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={adult.name || ''}
                    onChange={(e) => updateAdditionalAdult(index, 'name', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={adult.phone || ''}
                    onChange={(e) => updateAdditionalAdult(index, 'phone', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Government ID"
                    value={adult.govtIdNumber || ''}
                    onChange={(e) => updateAdditionalAdult(index, 'govtIdNumber', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Relation to Main Tenant"
                    value={adult.relation || ''}
                    onChange={(e) => updateAdditionalAdult(index, 'relation', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && updateAdditionalAdult(index, 'image', e.target.files[0])}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Government ID Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && updateAdditionalAdult(index, 'govtIdImage', e.target.files[0])}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Images Update */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Update Main Tenant Images (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Tenant Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('tenantImage', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Government ID (Front)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('govtIdFront', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Government ID (Back)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('govtIdBack', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isAgent ? 'Submitting for Approval...' : 'Updating Tenant...'}
                </div>
              ) : (
                isAgent ? 'Submit for Approval' : 'Update Tenant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTenantModal;
