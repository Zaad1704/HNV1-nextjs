import React, { useState } from 'react';
import { X, Upload, User, Phone, Mail, MapPin, CreditCard, Users, Camera, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';

interface ComprehensiveTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: (tenant: any) => void;
}

const ComprehensiveTenantModal: React.FC<ComprehensiveTenantModalProps> = ({ isOpen, onClose, onTenantAdded }) => {
  const [searchParams] = useSearchParams();
  const preSelectedProperty = searchParams.get('propertyId');
  const preSelectedUnit = searchParams.get('unit');
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    propertyId: preSelectedProperty || '',
    unit: preSelectedUnit || '',
    rentAmount: '',
    leaseStartDate: '',
    leaseEndDate: '',
    leaseDuration: '12', // months
    securityDeposit: '',
    advanceRent: '',
    status: 'Active',
    
    // Personal Details
    fatherName: '',
    motherName: '',
    presentAddress: '',
    permanentAddress: '',
    govtIdNumber: '',
    
    // Reference (Optional)
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
    
    // Residential Properties
    numberOfOccupants: 1
  });
  
  const [images, setImages] = useState({
    tenantImage: null as File | null,
    govtIdFront: null as File | null,
    govtIdBack: null as File | null
  });
  
  const [additionalAdults, setAdditionalAdults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  
  const selectedProperty = properties.find(p => p._id === formData.propertyId);
  const isCommercial = selectedProperty?.propertyType === 'Commercial';
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields: Name, Email, and Phone');
      }
      
      if (!formData.propertyId || !formData.unit) {
        throw new Error('Please select a property and unit');
      }
      
      if (!formData.rentAmount || !formData.leaseStartDate || !formData.leaseEndDate) {
        throw new Error('Please fill in rent amount and lease dates');
      }
      
      if (!formData.securityDeposit) {
        throw new Error('Please enter security deposit amount');
      }
      
      if (!formData.fatherName || !formData.motherName || !formData.presentAddress || !formData.permanentAddress || !formData.govtIdNumber) {
        throw new Error('Please fill in all personal details');
      }
      
      if (!formData.emergencyContactName || !formData.emergencyContactPhone || !formData.emergencyContactRelation) {
        throw new Error('Please fill in emergency contact information');
      }
      
      if (!images.tenantImage || !images.govtIdFront || !images.govtIdBack) {
        throw new Error('Please upload tenant photo and both sides of government ID');
      }
      
      const submitData = new FormData();
      
      // Add basic form data with proper type conversion
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value !== null && value !== undefined && value !== '') {
          submitData.append(key, String(value));
        }
      });
      
      // Add images
      if (images.tenantImage) {
        submitData.append('tenantImage', images.tenantImage);
      }
      if (images.govtIdFront) {
        submitData.append('govtIdFront', images.govtIdFront);
      }
      if (images.govtIdBack) {
        submitData.append('govtIdBack', images.govtIdBack);
      }
      
      // Add additional adults with images
      if (additionalAdults.length > 0) {
        const adultsData = additionalAdults.map((adult, index) => {
          const adultData = { ...adult };
          delete adultData.image;
          delete adultData.govtIdImage;
          return adultData;
        });
        submitData.append('additionalAdults', JSON.stringify(adultsData));
        
        // Add additional adult images
        additionalAdults.forEach((adult, index) => {
          if (adult.image) {
            submitData.append(`additionalAdultImage_${index}`, adult.image);
          }
          if (adult.govtIdImage) {
            submitData.append(`additionalAdultGovtId_${index}`, adult.govtIdImage);
          }
        });
      }
      
      console.log('Submitting tenant data...');
      console.log('🔍 Submitting to API...');
      const { data } = await apiClient.post('/tenants', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // 60 second timeout for file uploads
      });
      console.log('✅ API response:', data);
      
      if (data?.success && data?.data) {
        onTenantAdded(data.data);
        alert('Tenant added successfully!');
        onClose();
        
        // Reset form
        setFormData({
          name: '', email: '', phone: '', whatsappNumber: '',
          propertyId: preSelectedProperty || '', unit: preSelectedUnit || '', rentAmount: '',
          leaseStartDate: '', leaseEndDate: '', leaseDuration: '12', securityDeposit: '', advanceRent: '',
          status: 'Active', fatherName: '', motherName: '', presentAddress: '', permanentAddress: '',
          govtIdNumber: '', referenceName: '', referencePhone: '', referenceEmail: '',
          referenceAddress: '', referenceRelation: '', referenceGovtId: '',
          emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
          occupation: '', monthlyIncome: '', previousAddress: '', reasonForMoving: '',
          petDetails: '', vehicleDetails: '', specialInstructions: '', numberOfOccupants: 1
        });
        setImages({ tenantImage: null, govtIdFront: null, govtIdBack: null });
        setAdditionalAdults([]);
      } else {
        throw new Error(data?.message || 'Failed to add tenant - invalid response');
      }
    } catch (error: any) {
      console.error('Tenant submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add tenant';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add New Tenant
            </h3>
            <p className="text-gray-600 mt-1">Complete tenant information and lease details</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <X size={24} className="text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number (if different)
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Property & Unit Details */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Property & Unit Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Unit *
                </label>
                {formData.propertyId ? (
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {(() => {
                      const selectedProperty = properties.find(p => p._id === formData.propertyId);
                      if (!selectedProperty) return <p className="text-gray-500">Property not found</p>;
                      
                      const occupiedUnits = tenants
                        .filter(t => t.propertyId === formData.propertyId && t.status === 'Active')
                        .map(t => t.unit)
                        .filter(Boolean);
                      
                      const allUnits = Array.from({ length: selectedProperty.numberOfUnits || 1 }, (_, i) => (i + 1).toString());
                      
                      return allUnits.map(unit => {
                        const isOccupied = occupiedUnits.includes(unit);
                        const tenant = tenants.find(t => t.propertyId === formData.propertyId && t.unit === unit && t.status === 'Active');
                        
                        return (
                          <div key={unit} className={`flex items-center justify-between p-2 rounded ${
                            isOccupied ? 'bg-red-50 opacity-60' : 'hover:bg-green-50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="unit"
                                value={unit}
                                checked={formData.unit === unit}
                                disabled={isOccupied}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <div>
                                <p className={`font-medium ${
                                  isOccupied ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  Unit {unit}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {isOccupied ? `Occupied by ${tenant?.name}` : 'Available'}
                                </p>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isOccupied ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {isOccupied ? 'Occupied' : 'Vacant'}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 text-center">Select a property first to see available units</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent *
                </label>
                <input
                  type="number"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Start Date *
                </label>
                <input
                  type="date"
                  value={formData.leaseStartDate}
                  onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Duration (Months) *
                </label>
                <select
                  value={formData.leaseDuration}
                  onChange={(e) => {
                    const duration = e.target.value;
                    let newFormData = { ...formData, leaseDuration: duration };
                    
                    // Auto-calculate lease end date
                    if (formData.leaseStartDate) {
                      const startDate = new Date(formData.leaseStartDate);
                      const endDate = new Date(startDate);
                      endDate.setMonth(endDate.getMonth() + parseInt(duration));
                      newFormData.leaseEndDate = endDate.toISOString().split('T')[0];
                    }
                    
                    setFormData(newFormData);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease End Date *
                </label>
                <input
                  type="date"
                  value={formData.leaseEndDate}
                  onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit *
                </label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Rent (Optional)
                </label>
                <input
                  type="number"
                  value={formData.advanceRent}
                  onChange={(e) => setFormData({ ...formData, advanceRent: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name *
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name *
                </label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Present Address *
                </label>
                <textarea
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permanent Address *
                </label>
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID Number *
                </label>
                <input
                  type="text"
                  value={formData.govtIdNumber}
                  onChange={(e) => setFormData({ ...formData, govtIdNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('tenantImage', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID (Front) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('govtIdFront', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID (Back) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('govtIdBack', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Emergency Contact *</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship *
                </label>
                <select
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
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

          {/* Additional Details */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income
                </label>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Address
                </label>
                <textarea
                  value={formData.previousAddress}
                  onChange={(e) => setFormData({ ...formData, previousAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Moving
                </label>
                <textarea
                  value={formData.reasonForMoving}
                  onChange={(e) => setFormData({ ...formData, reasonForMoving: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Details (if any)
                </label>
                <input
                  type="text"
                  value={formData.petDetails}
                  onChange={(e) => setFormData({ ...formData, petDetails: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1 Dog, 2 Cats"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Details
                </label>
                <input
                  type="text"
                  value={formData.vehicleDetails}
                  onChange={(e) => setFormData({ ...formData, vehicleDetails: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Car - ABC123, Bike - XYZ789"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions/Notes
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any special requirements, medical conditions, or important notes..."
              />
            </div>
          </div>

          {/* Residential Occupants */}
          {!isCommercial && (
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4">Residential Details</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People Staying *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfOccupants}
                  onChange={(e) => setFormData({ ...formData, numberOfOccupants: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium">Additional Adults</h5>
                <button
                  type="button"
                  onClick={addAdditionalAdult}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Adult
                </button>
              </div>
              
              {additionalAdults.map((adult, index) => (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h6 className="font-medium">Adult {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeAdditionalAdult(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={adult.name}
                      onChange={(e) => updateAdditionalAdult(index, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={adult.phone}
                      onChange={(e) => updateAdditionalAdult(index, 'phone', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Government ID"
                      value={adult.govtIdNumber}
                      onChange={(e) => updateAdditionalAdult(index, 'govtIdNumber', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Relation to Main Tenant"
                      value={adult.relation}
                      onChange={(e) => updateAdditionalAdult(index, 'relation', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateAdditionalAdult(index, 'image', e.target.files?.[0] || null)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Government ID Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateAdditionalAdult(index, 'govtIdImage', e.target.files?.[0] || null)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reference (Optional) */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold mb-4">Reference (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Name
                </label>
                <input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Phone
                </label>
                <input
                  type="tel"
                  value={formData.referencePhone}
                  onChange={(e) => setFormData({ ...formData, referencePhone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Email
                </label>
                <input
                  type="email"
                  value={formData.referenceEmail}
                  onChange={(e) => setFormData({ ...formData, referenceEmail: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relation
                </label>
                <input
                  type="text"
                  value={formData.referenceRelation}
                  onChange={(e) => setFormData({ ...formData, referenceRelation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Address
                </label>
                <textarea
                  value={formData.referenceAddress}
                  onChange={(e) => setFormData({ ...formData, referenceAddress: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Government ID
                </label>
                <input
                  type="text"
                  value={formData.referenceGovtId}
                  onChange={(e) => setFormData({ ...formData, referenceGovtId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  Adding Tenant...
                </div>
              ) : (
                'Add Tenant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComprehensiveTenantModal;