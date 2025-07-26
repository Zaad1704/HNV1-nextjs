import React, { useState } from 'react';
import { UserPlus, X, Mail, User, Shield, Building2, Send } from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: any) => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInvite
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    properties: [] as string[],
    message: '',
    sendWelcomeEmail: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onInvite(formData);
      onClose();
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        properties: [],
        message: '',
        sendWelcomeEmail: true
      });
    } catch (error) {
      console.error('Invitation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: 'tenant', label: 'Tenant', description: 'Can view their own rental information' },
    { value: 'property_manager', label: 'Property Manager', description: 'Can manage assigned properties' },
    { value: 'agent', label: 'Agent', description: 'Can handle tenant relations and payments' },
    { value: 'admin', label: 'Admin', description: 'Full access to all features' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to reports' }
  ];

  const properties = [
    { id: '1', name: 'Sunset Apartments' },
    { id: '2', name: 'Downtown Complex' },
    { id: '3', name: 'Garden View Homes' },
    { id: '4', name: 'Riverside Condos' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus size={24} className="text-blue-500" />
              Invite User
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Send an invitation to join your property management system</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User size={20} />
              User Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield size={20} />
              Role & Permissions
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role *
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label key={role.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="mt-1"
                      required
                    />
                    <div>
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Property Access */}
          {(formData.role === 'property_manager' || formData.role === 'agent') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 size={20} />
                Property Access
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Properties
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {properties.map((property) => (
                    <label key={property.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.properties.includes(property.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              properties: [...prev.properties, property.id] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              properties: prev.properties.filter(id => id !== property.id) 
                            }));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{property.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Personal Message */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Message</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal welcome message..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Send welcome email with login instructions</span>
            </label>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Invitation Preview</h4>
            <div className="text-sm text-blue-800">
              <p><strong>{formData.firstName} {formData.lastName}</strong> will be invited as a <strong>{roles.find(r => r.value === formData.role)?.label}</strong></p>
              {formData.properties.length > 0 && (
                <p className="mt-1">Access to {formData.properties.length} propert{formData.properties.length === 1 ? 'y' : 'ies'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Invitation
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;