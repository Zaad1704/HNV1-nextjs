import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, Search, Image } from 'lucide-react';
import apiClient from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: (tenant: any) => void;
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onTenantAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unit: '',
    rentAmount: '',
    leaseStartDate: '',
    leaseEndDate: '',
    leaseDuration: '12',
    securityDeposit: '',
    status: 'Active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone?.trim()) errors.phone = 'Phone number is required';
    if (!formData.propertyId) errors.propertyId = 'Please select a property';
    if (!formData.unit?.trim()) errors.unit = 'Please select or enter a unit';
    if (!formData.rentAmount || parseFloat(formData.rentAmount) <= 0) {
      errors.rentAmount = 'Please enter a valid rent amount';
    }
    
    if (formData.leaseStartDate && formData.leaseEndDate) {
      if (new Date(formData.leaseEndDate) <= new Date(formData.leaseStartDate)) {
        errors.leaseEndDate = 'Lease end date must be after start date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const [vacantUnits, setVacantUnits] = useState([]);
  const [showUnits, setShowUnits] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [govtIdFront, setGovtIdFront] = useState<File | null>(null);
  const [govtIdFrontPreview, setGovtIdFrontPreview] = useState<string>('');
  const [govtIdBack, setGovtIdBack] = useState<File | null>(null);
  const [govtIdBackPreview, setGovtIdBackPreview] = useState<string>('');
  const [additionalAdults, setAdditionalAdults] = useState([{ name: '', phone: '', govtIdNumber: '', relation: '' }]);
  const [adultImages, setAdultImages] = useState<{[key: string]: File}>({});
  const [adultImagePreviews, setAdultImagePreviews] = useState<{[key: string]: string}>({});

  const { data: properties = [], error: propertiesError } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      try {
        console.log('Fetching properties...');
        const { data } = await apiClient.get('/properties');
        console.log('Properties response:', data);
        return data.data || [];
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        throw error;
      }
    },
    enabled: isOpen,
    retry: 2,
    retryDelay: 1000
  });
  
  // Log properties error if any
  if (propertiesError) {
    console.error('Properties query error:', propertiesError);
  }

  // Fetch vacant units when property is selected
  useEffect(() => {
    const fetchVacantUnits = async () => {
      if (formData.propertyId) {
        setLoadingUnits(true);
        try {
          console.log('Fetching vacant units for property:', formData.propertyId);
          const { data } = await apiClient.get(`/properties/${formData.propertyId}/vacant-units`);
          console.log('Vacant units response:', data);
          setVacantUnits(data.data || []);
        } catch (error) {
          console.error('Failed to fetch vacant units:', error);
          setVacantUnits([]);
        } finally {
          setLoadingUnits(false);
        }
      } else {
        setVacantUnits([]);
        setShowUnits(false);
      }
    };
    fetchVacantUnits();
  }, [formData.propertyId]);

  // Auto-calculate lease end date when duration or start date changes
  useEffect(() => {
    if (formData.leaseStartDate && formData.leaseDuration) {
      const startDate = new Date(formData.leaseStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(formData.leaseDuration));
      const calculatedEndDate = endDate.toISOString().split('T')[0];
      
      setFormData(prev => ({ ...prev, leaseEndDate: calculatedEndDate }));
    }
  }, [formData.leaseStartDate, formData.leaseDuration]);

  // Auto-fill rent amount when unit is selected
  const handleUnitSelect = (unit: any) => {
    try {
      if (unit && unit.unitNumber) {
        setFormData(prev => ({
          ...prev,
          unit: unit.unitNumber,
          rentAmount: unit.lastRentAmount || unit.suggestedRent || prev.rentAmount
        }));
      }
      setShowUnits(false);
    } catch (error) {
      console.error('Error selecting unit:', error);
      setShowUnits(false);
    }
  };

  const handleUnitInputClick = () => {
    if (formData.propertyId && vacantUnits.length > 0) {
      setShowUnits(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUnits(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGovtIdChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === 'front') {
        setGovtIdFront(file);
        const reader = new FileReader();
        reader.onloadend = () => setGovtIdFrontPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setGovtIdBack(file);
        const reader = new FileReader();
        reader.onloadend = () => setGovtIdBackPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAdultImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, type: 'photo' | 'govtId') => {
    const file = e.target.files?.[0];
    if (file) {
      const key = `adult_${index}_${type}`;
      setAdultImages(prev => ({ ...prev, [key]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setAdultImagePreviews(prev => ({ ...prev, [key]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addAdult = () => {
    setAdditionalAdults(prev => [...prev, { name: '', phone: '', govtIdNumber: '', relation: '' }]);
  };

  const removeAdult = (index: number) => {
    setAdditionalAdults(prev => prev.filter((_, i) => i !== index));
    // Remove associated images
    const photoKey = `adult_${index}_photo`;
    const govtIdKey = `adult_${index}_govtId`;
    setAdultImages(prev => {
      const newImages = { ...prev };
      delete newImages[photoKey];
      delete newImages[govtIdKey];
      return newImages;
    });
    setAdultImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[photoKey];
      delete newPreviews[govtIdKey];
      return newPreviews;
    });
  };

  const updateAdult = (index: number, field: string, value: string) => {
    setAdditionalAdults(prev => prev.map((adult, i) => 
      i === index ? { ...adult, [field]: value } : adult
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsLoading(true);
    setShowSuccess(false);
    
    try {
      console.log('Starting tenant submission...');
      
      // Use the validateForm function
      if (!validateForm()) {
        throw new Error('Please fix the validation errors');
      }
      
      const tenantData = {
        ...formData,
        rentAmount: Number(formData.rentAmount) || 0,
        securityDeposit: Number(formData.securityDeposit) || 0
      };
      
      const submitFormData = new FormData();
      
      // Add all tenant data to FormData
      Object.keys(tenantData).forEach(key => {
        if (tenantData[key] !== undefined && tenantData[key] !== '') {
          submitFormData.append(key, tenantData[key].toString());
        }
      });
      
      // Add image files if selected
      if (imageFile) {
        submitFormData.append('tenantImage', imageFile);
      }
      if (govtIdFront) {
        submitFormData.append('govtIdFront', govtIdFront);
      }
      if (govtIdBack) {
        submitFormData.append('govtIdBack', govtIdBack);
      }
      
      // Add additional adults data and images
      submitFormData.append('additionalAdults', JSON.stringify(additionalAdults));
      Object.entries(adultImages).forEach(([key, file]) => {
        submitFormData.append(key, file);
      });
      
      const response = await apiClient.post('/tenants', submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // Increased timeout for file uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${progress}%`);
          }
        }
      });
      
      console.log('Tenant creation response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        onTenantAdded(response.data.data);
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
        
        // Reset form
        setFormData({
          name: '', email: '', phone: '', propertyId: '', unit: '',
          rentAmount: '', leaseStartDate: '', leaseEndDate: '', leaseDuration: '12', securityDeposit: '', status: 'Active'
        });
        setImageFile(null);
        setImagePreview('');
        setGovtIdFront(null);
        setGovtIdFrontPreview('');
        setGovtIdBack(null);
        setGovtIdBackPreview('');
        setAdditionalAdults([{ name: '', phone: '', govtIdNumber: '', relation: '' }]);
        setAdultImages({});
        setAdultImagePreviews({});
      } else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (error: any) {
      console.error('Tenant submission error:', error);
      
      let errorMessage = 'Failed to add tenant';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - please check your connection';
      } else if (error.message) {
        // Validation or other error
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Tenant</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                aria-describedby={validationErrors.name ? 'name-error' : undefined}
              />
              {validationErrors.name && <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">{validationErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
              />
              {validationErrors.email && <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">{validationErrors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property</label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unit: '', rentAmount: '' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select Property</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>{property.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit *
                {loadingUnits && <span className="text-xs text-blue-600 ml-2">Loading...</span>}
                {vacantUnits.length > 0 && <span className="text-xs text-green-600 ml-2">{vacantUnits.length} available</span>}
              </label>
              {formData.propertyId && vacantUnits.length > 0 ? (
                <select
                  value={formData.unit}
                  onChange={(e) => {
                    const selectedUnit = vacantUnits.find((u: any) => u.unitNumber === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      unit: e.target.value,
                      rentAmount: selectedUnit?.lastRentAmount || selectedUnit?.suggestedRent || prev.rentAmount
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select vacant unit</option>
                  {vacantUnits.map((unit: any) => (
                    <option key={unit.unitNumber} value={unit.unitNumber}>
                      Unit {unit.unitNumber} {unit.lastRentAmount > 0 ? `($${unit.lastRentAmount}/month)` : '(No previous rent)'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={formData.propertyId ? (loadingUnits ? "Loading units..." : "No vacant units or enter manually") : "Select property first"}
                  required
                />
              )}
              {formData.propertyId && vacantUnits.length === 0 && !loadingUnits && (
                <p className="text-xs text-red-600 mt-1">⚠️ No vacant units available</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Rent Amount
                {formData.unit && formData.rentAmount && (
                  <span className="text-xs text-green-600 ml-2">
                    ✓ Auto-filled for Unit {formData.unit}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={formData.unit ? "Amount for selected unit" : "Enter rent amount"}
                  required
                />
              </div>
              {formData.unit && !formData.rentAmount && (
                <p className="text-xs text-amber-600 mt-1">
                  No previous rent data for Unit {formData.unit}. Please enter amount manually.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security Deposit</label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lease Start</label>
              <input
                type="date"
                value={formData.leaseStartDate}
                onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (Months)</label>
              <select
                value={formData.leaseDuration}
                onChange={(e) => setFormData({ ...formData, leaseDuration: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lease End (Auto-calculated)</label>
              <input
                type="date"
                value={formData.leaseEndDate}
                onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {formData.leaseStartDate && formData.leaseDuration && (
                <p className="text-xs text-green-600 mt-1">✓ {formData.leaseDuration} months from start</p>
              )}
            </div>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tenant Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tenant Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <User size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 mb-2">Tenant Photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="tenant-image"
                    />
                    <label
                      htmlFor="tenant-image"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 text-xs"
                    >
                      <Upload size={12} />
                      Upload
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Government ID Front */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Front</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {govtIdFrontPreview ? (
                  <div className="relative">
                    <img src={govtIdFrontPreview} alt="ID Front" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setGovtIdFront(null);
                        setGovtIdFrontPreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 mb-2">ID Front</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGovtIdChange(e, 'front')}
                      className="hidden"
                      id="govt-id-front"
                    />
                    <label
                      htmlFor="govt-id-front"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg cursor-pointer hover:bg-green-100 text-xs"
                    >
                      <Upload size={12} />
                      Upload
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Government ID Back */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Back</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {govtIdBackPreview ? (
                  <div className="relative">
                    <img src={govtIdBackPreview} alt="ID Back" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setGovtIdBack(null);
                        setGovtIdBackPreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 mb-2">ID Back</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGovtIdChange(e, 'back')}
                      className="hidden"
                      id="govt-id-back"
                    />
                    <label
                      htmlFor="govt-id-back"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-100 text-xs"
                    >
                      <Upload size={12} />
                      Upload
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Adults */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Additional Adults</h4>
              <button
                type="button"
                onClick={addAdult}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                + Add Adult
              </button>
            </div>
            
            {additionalAdults.map((adult, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium">Adult {index + 1}</h5>
                  {additionalAdults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdult(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={adult.name}
                    onChange={(e) => updateAdult(index, 'name', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={adult.phone}
                    onChange={(e) => updateAdult(index, 'phone', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="ID Number"
                    value={adult.govtIdNumber}
                    onChange={(e) => updateAdult(index, 'govtIdNumber', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Relation"
                    value={adult.relation}
                    onChange={(e) => updateAdult(index, 'relation', e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Adult Photo */}
                  <div>
                    <label className="block text-xs font-medium mb-1">Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                      {adultImagePreviews[`adult_${index}_photo`] ? (
                        <div className="relative">
                          <img src={adultImagePreviews[`adult_${index}_photo`]} alt="Adult" className="w-full h-20 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => {
                              const key = `adult_${index}_photo`;
                              setAdultImages(prev => { const newImages = {...prev}; delete newImages[key]; return newImages; });
                              setAdultImagePreviews(prev => { const newPreviews = {...prev}; delete newPreviews[key]; return newPreviews; });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAdultImageChange(e, index, 'photo')}
                            className="hidden"
                            id={`adult-photo-${index}`}
                          />
                          <label htmlFor={`adult-photo-${index}`} className="cursor-pointer text-xs text-blue-600">
                            Upload Photo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Adult ID */}
                  <div>
                    <label className="block text-xs font-medium mb-1">ID Document</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                      {adultImagePreviews[`adult_${index}_govtId`] ? (
                        <div className="relative">
                          <img src={adultImagePreviews[`adult_${index}_govtId`]} alt="ID" className="w-full h-20 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => {
                              const key = `adult_${index}_govtId`;
                              setAdultImages(prev => { const newImages = {...prev}; delete newImages[key]; return newImages; });
                              setAdultImagePreviews(prev => { const newPreviews = {...prev}; delete newPreviews[key]; return newPreviews; });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAdultImageChange(e, index, 'govtId')}
                            className="hidden"
                            id={`adult-id-${index}`}
                          />
                          <label htmlFor={`adult-id-${index}`} className="cursor-pointer text-xs text-green-600">
                            Upload ID
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              {isSubmitting ? 'Adding...' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenantModal;