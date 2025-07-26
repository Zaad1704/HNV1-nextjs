import React, { useState } from 'react';
import { X, DollarSign, Calendar, Building2, Upload, Camera, FileText, Users } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

interface AgentHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHandoverRecorded: (handover: any) => void;
}

const AgentHandoverModal: React.FC<AgentHandoverModalProps> = ({ isOpen, onClose, onHandoverRecorded }) => {
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    agentName: '',
    collectionDate: new Date().toISOString().split('T')[0],
    handoverDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    handoverMethod: 'cash_handover',
    bankDetails: '',
    referenceNumber: '',
    notes: '',
    propertyIds: [] as string[]
  });
  
  const [images, setImages] = useState({
    handoverProof: null as File | null,
    collectionSheet: null as File | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const handleImageUpload = (field: string, file: File) => {
    setImages(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'propertyIds') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key as keyof typeof formData] as string);
        }
      });
      
      // Add images
      if (images.handoverProof) {
        submitData.append('handoverProof', images.handoverProof);
      }
      if (images.collectionSheet) {
        submitData.append('collectionSheet', images.collectionSheet);
      }
      
      submitData.append('recordedBy', user?._id || '');
      submitData.append('organizationId', user?.organizationId || '');
      
      const response = await apiClient.post('/agent-handovers', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onHandoverRecorded(response.data.data);
      alert('Agent handover recorded successfully!');
      onClose();
      
      // Reset form
      setFormData({
        agentName: '',
        collectionDate: new Date().toISOString().split('T')[0],
        handoverDate: new Date().toISOString().split('T')[0],
        totalAmount: '',
        handoverMethod: 'cash_handover',
        bankDetails: '',
        referenceNumber: '',
        notes: '',
        propertyIds: []
      });
      setImages({ handoverProof: null, collectionSheet: null });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to record agent handover');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-dark-orange-blue rounded-2xl flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Agent Daily Collection Handover</h3>
              <p className="text-gray-600">Record agent's daily collection and handover to landlord</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent & Collection Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Name of collecting agent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Date *
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.collectionDate}
                  onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>
            </div>
          </div>

          {/* Properties Covered */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Properties Covered (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-32 overflow-y-auto border border-gray-300 rounded-xl p-3">
              {properties.map((property: any) => (
                <label key={property._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.propertyIds.includes(property._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          propertyIds: [...prev.propertyIds, property._id]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          propertyIds: prev.propertyIds.filter(id => id !== property._id)
                        }));
                      }
                    }}
                    className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                  />
                  <span className="text-sm text-gray-700">{property.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount & Handover Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount Collected *
              </label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handover Date *
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.handoverDate}
                  onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  required
                />
              </div>
            </div>
          </div>

          {/* Handover Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handover Method *
            </label>
            <select
              value={formData.handoverMethod}
              onChange={(e) => setFormData({ ...formData, handoverMethod: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              required
            >
              <option value="cash_handover">Cash Handover to Landlord</option>
              <option value="bank_deposit">Bank Deposit</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="office_deposit">Office Deposit</option>
            </select>
          </div>

          {/* Bank Details (if bank method) */}
          {(formData.handoverMethod === 'bank_deposit' || formData.handoverMethod === 'bank_transfer') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Details
                </label>
                <input
                  type="text"
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Bank name, account details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Deposit slip, transfer reference"
                />
              </div>
            </div>
          )}

          {/* Image Uploads */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Upload Proof Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handover Proof (Cash/Deposit Receipt) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('handoverProof', e.target.files[0])}
                    className="hidden"
                    id="handoverProof"
                    required
                  />
                  <label htmlFor="handoverProof" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      {images.handoverProof ? images.handoverProof.name : 'Upload handover proof'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Sheet (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload('collectionSheet', e.target.files[0])}
                    className="hidden"
                    id="collectionSheet"
                  />
                  <label htmlFor="collectionSheet" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      {images.collectionSheet ? images.collectionSheet.name : 'Upload collection sheet'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              rows={3}
              placeholder="Any additional details about the collection and handover..."
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2">Handover Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Agent:</strong> {formData.agentName || 'Not specified'}</p>
              <p><strong>Collection Date:</strong> {formData.collectionDate}</p>
              <p><strong>Total Amount:</strong> {currency}{formData.totalAmount || '0'}</p>
              <p><strong>Handover Method:</strong> {formData.handoverMethod.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Properties:</strong> {formData.propertyIds.length} selected</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !images.handoverProof}
              className="px-8 py-3 btn-gradient text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-bold"
            >
              {isSubmitting ? 'Recording Handover...' : 'Record Agent Handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentHandoverModal;