import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Users, Building2, Check, Percent } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface BulkPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tenant {
  _id: string;
  name: string;
  email: string;
  rentAmount: number;
  unit: string;
  status: string;
}

interface Property {
  _id: string;
  name: string;
  address: any;
}

const BulkPaymentModal: React.FC<BulkPaymentModalProps> = ({ isOpen, onClose }) => {
  const { currency } = useCurrency();
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [generatedReceipts, setGeneratedReceipts] = useState([]);
  const [handwrittenReceipts, setHandwrittenReceipts] = useState<{[key: string]: string}>({});
  const [tenantSearch, setTenantSearch] = useState('');

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const { data: tenants = [], isLoading: tenantsLoading, error: tenantsError } = useQuery({
    queryKey: ['tenants', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty) return [];
      const { data } = await apiClient.get(`/tenants?propertyId=${selectedProperty}`);
      return data.data || [];
    },
    enabled: !!selectedProperty
  });

  // Get available months (current and future)
  const getAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push({
        value: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
    return months;
  };

  // Check if tenant has already paid for selected month
  const { data: payments = [] } = useQuery({
    queryKey: ['payments', selectedProperty, selectedMonth],
    queryFn: async () => {
      if (!selectedProperty || !selectedMonth) return [];
      const { data } = await apiClient.get(`/payments/property/${selectedProperty}/month/${selectedMonth}`);
      return data.data || [];
    },
    enabled: !!selectedProperty && !!selectedMonth
  });

  // Check if tenant has past dues or already paid
  const getTenantStatus = (tenant: Tenant) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const selectedMonthDate = new Date(selectedMonth + '-01');
    const currentMonthDate = new Date(currentMonth + '-01');
    
    // Check if already paid for selected month
    const alreadyPaid = payments.some((payment: any) => 
      (payment.tenantId === tenant._id || payment.tenantId?._id === tenant._id) && 
      payment.rentMonth === selectedMonth &&
      (payment.status === 'Paid' || payment.status === 'completed')
    );
    
    if (alreadyPaid) return 'paid';
    
    // If selecting current month, check for past dues
    if (selectedMonthDate.getTime() === currentMonthDate.getTime()) {
      return tenant.status === 'Late' ? 'pastdue' : 'eligible';
    }
    
    return 'eligible';
  };

  const calculateDiscountedAmount = (originalAmount: number) => {
    if (discountType === 'none') return originalAmount;
    
    const discount = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return originalAmount - (originalAmount * discount / 100);
    } else {
      return Math.max(0, originalAmount - discount);
    }
  };

  const getTotalAmount = () => {
    return selectedTenants.reduce((total, tenantId) => {
      const tenant = tenants.find((t: Tenant) => t._id === tenantId);
      if (!tenant) return total;
      return total + calculateDiscountedAmount(tenant.rentAmount || 0);
    }, 0);
  };

  const handleSelectAllTenants = () => {
    const eligibleTenants = tenants.filter((t: Tenant) => {
      const status = getTenantStatus(t);
      return t.status === 'Active' && status === 'eligible';
    });
    
    setSelectedTenants(eligibleTenants.map((t: Tenant) => t._id));
  };

  const handleDeselectAllTenants = () => {
    setSelectedTenants([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || selectedTenants.length === 0) {
      alert('Please select a property and at least one tenant');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payments = selectedTenants.map(tenantId => {
        const tenant = tenants.find((t: Tenant) => t._id === tenantId);
        const originalAmount = tenant?.rentAmount || 0;
        const finalAmount = calculateDiscountedAmount(originalAmount);
        
        return {
          tenantId,
          propertyId: selectedProperty,
          amount: finalAmount,
          originalAmount,
          discount: discountType !== 'none' ? {
            type: discountType,
            value: parseFloat(discountValue) || 0,
            amount: originalAmount - finalAmount
          } : null,
          paymentDate,
          paymentMethod,
          description: `Monthly Rent Payment${discountType !== 'none' ? ' (with discount)' : ''}`,
          status: 'Paid'
        };
      });

      const response = await apiClient.post('/bulk/payments', { 
        payments: payments.map(payment => ({
          ...payment,
          handwrittenReceiptNumber: handwrittenReceipts[payment.tenantId] || null
        })),
        month: selectedMonth,
        generateReceipts: true
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to record payments');
      }
      
      // Store generated receipts
      setGeneratedReceipts(response.data.data.receipts || []);
      setShowReceipts(true);
      
      alert(`Bulk payment recorded successfully for ${selectedTenants.length} tenants!`);
      
      // Don't reset form immediately - show receipts first
    } catch (error: any) {
      console.error('Failed to record bulk payment:', error);
      alert(error.response?.data?.message || 'Failed to record bulk payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">Bulk Payment</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Property
            </label>
            <div className="relative">
              <Building2 size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  setSelectedTenants([]);
                }}
                className="w-full pl-10 pr-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
                required
              >
                <option value="">Choose a property...</option>
                {properties.map((property: Property) => (
                  <option key={property._id} value={property._id}>
                    {property.name} - {property.address?.formattedAddress || 'No address'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tenant Selection */}
          {selectedProperty && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Tenants ({selectedTenants.length} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllTenants}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllTenants}
                    className="text-xs px-2 py-1 bg-white/20 text-gray-700 rounded hover:bg-white/30"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search tenants by name, unit, phone, or email..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 bg-white/10 text-gray-700 text-sm placeholder-gray-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-white/30 rounded-lg p-3 space-y-2">
                {tenantsLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading tenants...</p>
                  </div>
                ) : tenantsError ? (
                  <p className="text-red-500 text-center py-4">Error loading tenants</p>
                ) : tenants.length > 0 ? (
                  tenants
                    .filter((tenant: Tenant) => {
                      if (!tenantSearch) return true;
                      const search = tenantSearch.toLowerCase();
                      return tenant.name?.toLowerCase().includes(search) ||
                             tenant.unit?.toLowerCase().includes(search) ||
                             tenant.email?.toLowerCase().includes(search);
                    })
                    .map((tenant: Tenant) => {
                    const tenantStatus = getTenantStatus(tenant);
                    const isDisabled = tenantStatus !== 'eligible';
                    
                    return (
                      <div key={tenant._id} className={`flex items-center justify-between p-2 rounded ${
                        isDisabled ? (tenantStatus === 'paid' ? 'bg-green-50 opacity-60' : 'bg-red-50 opacity-60') : 'hover:bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTenants.includes(tenant._id)}
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTenants(prev => [...prev, tenant._id]);
                              } else {
                                setSelectedTenants(prev => prev.filter(id => id !== tenant._id));
                              }
                            }}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400 disabled:opacity-50"
                          />
                          <div>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-gray-700">{tenant.name}</p>
                                <p className="text-sm text-gray-500">
                                  Unit: {tenant.unit} | Status: {tenant.status}
                                  {tenantStatus === 'paid' && (
                                    <span className="text-green-600 ml-2">(Already Paid for {selectedMonth})</span>
                                  )}
                                  {tenantStatus === 'pastdue' && (
                                    <span className="text-red-600 ml-2">(Past Due - Cannot select for current month)</span>
                                  )}
                                </p>
                              </div>
                              {selectedTenants.includes(tenant._id) && (
                                <input
                                  type="text"
                                  placeholder="Receipt #"
                                  value={handwrittenReceipts[tenant._id] || ''}
                                  onChange={(e) => setHandwrittenReceipts(prev => ({
                                    ...prev,
                                    [tenant._id]: e.target.value
                                  }))}
                                  className="w-24 px-2 py-1 text-xs border border-white/30 rounded focus:ring-1 focus:ring-orange-400 bg-white/10 text-gray-700"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-700">{currency}{tenant.rentAmount || 0}</p>
                          {discountType !== 'none' && selectedTenants.includes(tenant._id) && (
                            <p className="text-sm text-green-600">
                              After discount: {currency}{calculateDiscountedAmount(tenant.rentAmount || 0).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No tenants found for this property</p>
                )}
              </div>
            </div>
          )}

          {/* Discount Section */}
          {selectedTenants.length > 0 && (
            <div className="border-t border-white/20 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Apply Discount (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="none"
                      checked={discountType === 'none'}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="mr-2"
                    />
                    No Discount
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={discountType === 'percentage'}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="mr-2"
                    />
                    Percentage
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountType"
                      value="fixed"
                      checked={discountType === 'fixed'}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="mr-2"
                    />
                    Fixed Amount
                  </label>
                </div>
                
                {discountType !== 'none' && (
                  <div className="relative">
                    {discountType === 'percentage' ? (
                      <Percent size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    ) : (
                      <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    )}
                    <input
                      type="number"
                      step={discountType === 'percentage' ? '1' : '0.01'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
                      placeholder={discountType === 'percentage' ? '10' : '50.00'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rent Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedTenants([]); // Reset selection when month changes
              }}
              className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
              required
            >
              {getAvailableMonths().map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Online Payment">Online Payment</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          {selectedTenants.length > 0 && (
            <div className="bg-white/20 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Selected Tenants:</span>
                  <span>{selectedTenants.length}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Amount:</span>
                  <span>{currency}{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

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
              disabled={isSubmitting || selectedTenants.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-lg hover:from-orange-500 hover:to-blue-500 transition-colors disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Recording Payments...' : `Record Payment for ${selectedTenants.length} Tenant${selectedTenants.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
      
      {/* Receipts Modal */}
      {showReceipts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Payment Receipts Generated</h3>
            <p className="text-gray-600 mb-6">
              {generatedReceipts.length} receipts have been generated successfully.
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const response = await apiClient.post('/receipts/bulk-pdf', {
                      receiptIds: generatedReceipts.map((r: any) => r._id)
                    }, { responseType: 'blob' });
                    
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `bulk-receipts-${selectedMonth}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    alert('Failed to download PDF');
                  }
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                📄 Download PDF
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await apiClient.post('/receipts/thermal-print', {
                      receiptIds: generatedReceipts.map((r: any) => r._id)
                    });
                    
                    // Open print window with thermal receipt format
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(response.data);
                      printWindow.document.close();
                      
                      // Auto-print when loaded
                      printWindow.onload = () => {
                        printWindow.print();
                        printWindow.close();
                      };
                    }
                    
                    alert('Receipts sent to printer!');
                  } catch (error) {
                    alert('Failed to print receipts');
                  }
                }}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                🖨️ Print Receipts
              </button>
            </div>
            <button
              onClick={() => {
                setShowReceipts(false);
                onClose();
                // Reset form
                setSelectedProperty('');
                setSelectedTenants([]);
                setDiscountType('none');
                setDiscountValue('');
                setPaymentDate(new Date().toISOString().split('T')[0]);
                setPaymentMethod('Bank Transfer');
                setSelectedMonth(new Date().toISOString().slice(0, 7));
                setGeneratedReceipts([]);
                setHandwrittenReceipts({});
              }}
              className="w-full mt-3 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkPaymentModal;