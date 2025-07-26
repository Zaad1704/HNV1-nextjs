import React, { useState, useEffect } from 'react';
import { X, Upload, Image } from 'lucide-react';
import apiClient from '@/lib/api';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyUpdated: (property: any) => void;
  property: any;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ isOpen, onClose, onPropertyUpdated, property }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    numberOfUnits: 1,
    propertyType: 'Apartment',
    status: 'Active',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        name: property.name || '',
        address: {
          street: property.address?.street || '',
          city: property.address?.city || '',
          state: property.address?.state || '',
          zipCode: property.address?.zipCode || ''
        },
        numberOfUnits: property.numberOfUnits || 1,
        propertyType: property.propertyType || 'Apartment',
        status: property.status || 'Active',
        imageUrl: property.imageUrl || ''
      });
      setImagePreview(property.imageUrl || '');
    }
  }, [property, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address[street]', formData.address.street);
      formDataToSend.append('address[city]', formData.address.city);
      formDataToSend.append('address[state]', formData.address.state);
      formDataToSend.append('address[zipCode]', formData.address.zipCode);
      formDataToSend.append('numberOfUnits', formData.numberOfUnits.toString());
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('status', formData.status);
      
      if (!imageFile && formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      const response = await apiClient.put(`/properties/${property._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data?.success) {
        // Force image cache refresh
        const updatedProperty = {
          ...response.data.data,
          imageUrl: response.data.data.imageUrl ? `${response.data.data.imageUrl}?t=${Date.now()}` : ''
        };
        onPropertyUpdated(updatedProperty);
        alert('Property updated successfully!');
        onClose();
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to update property'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">Edit Property</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Units</label>
              <input
                type="number"
                min="1"
                value={formData.numberOfUnits}
                onChange={(e) => setFormData({ ...formData, numberOfUnits: Number(e.target.value) })}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Commercial">Commercial</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Image</label>
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
                  <Image size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Upload property image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="property-image-edit"
                  />
                  <label
                    htmlFor="property-image-edit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg cursor-pointer hover:bg-orange-200"
                  >
                    <Upload size={16} />
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-lg hover:from-orange-500 hover:to-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyModal;