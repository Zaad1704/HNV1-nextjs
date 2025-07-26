import React, { useState } from 'react';
import { X, Calendar, Download, FileText, Building2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

interface MonthlyCollectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProperty?: string;
}

const MonthlyCollectionSheet: React.FC<MonthlyCollectionSheetProps> = ({ isOpen, onClose, preSelectedProperty }) => {
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  const [selectedProperty, setSelectedProperty] = useState(preSelectedProperty || '');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Fetch collection data
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        ...(selectedProperty && { propertyId: selectedProperty })
      });
      
      const { data } = await apiClient.get(`/reports/collection-sheet?${params}`);
      const collectionData = data.data || [];
      
      // Generate PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const organizationName = user?.organization?.name || user?.name + "'s Organization" || "Your Organization";
      const monthName = months[selectedMonth - 1];
      const propertyName = selectedProperty ? properties.find(p => p._id === selectedProperty)?.name : 'All Properties';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Collection Sheet - ${monthName} ${selectedYear}</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                line-height: 1.6; 
                color: #333;
                background: #fff;
              }
              .container { max-width: 1200px; margin: 0 auto; }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              }
              .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 300; }
              .header h2 { font-size: 22px; margin-bottom: 15px; font-weight: 600; }
              .header p { font-size: 14px; opacity: 0.9; margin: 5px 0; }
              .report-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .info-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
              }
              .info-card h3 { color: #667eea; margin-bottom: 10px; font-size: 16px; }
              .summary {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 25px;
                border-radius: 10px;
                margin: 20px 0;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              }
              .summary h3 { margin-bottom: 15px; font-size: 20px; }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
              }
              .summary-item {
                background: rgba(255,255,255,0.2);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
              }
              .summary-item .label { font-size: 12px; opacity: 0.9; margin-bottom: 5px; }
              .summary-item .value { font-size: 18px; font-weight: bold; }
              .table-container {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                margin: 20px 0;
              }
              table { width: 100%; border-collapse: collapse; }
              th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 12px;
                text-align: left;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              td {
                padding: 12px;
                border-bottom: 1px solid #eee;
                font-size: 13px;
                vertical-align: middle;
              }
              tr:hover { background-color: #f8f9fa; }
              tr:nth-child(even) { background-color: #fafafa; }
              .status-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .paid { background: #d4edda; color: #155724; }
              .pending { background: #fff3cd; color: #856404; }
              .overdue { background: #f8d7da; color: #721c24; }
              .footer {
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                text-align: center;
                border-top: 3px solid #667eea;
              }
              .footer-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
              }
              .footer-stat {
                text-align: center;
              }
              .footer-stat .number {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
              }
              .footer-stat .label {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .branding {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #888;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .container { max-width: none; }
                .header, .summary { break-inside: avoid; }
                table { break-inside: auto; }
                tr { break-inside: avoid; break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${organizationName}</h1>
                <h2>Monthly Collection Sheet</h2>
                <p><strong>${monthName} ${selectedYear} - ${propertyName}</strong></p>
                <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
              
              <div class="report-info">
                <div class="info-card">
                  <h3>Report Details</h3>
                  <p><strong>Period:</strong> ${monthName} ${selectedYear}</p>
                  <p><strong>Property:</strong> ${propertyName}</p>
                  <p><strong>Generated By:</strong> ${user?.name || 'System'}</p>
                </div>
                <div class="info-card">
                  <h3>Organization</h3>
                  <p><strong>Name:</strong> ${organizationName}</p>
                  <p><strong>Report Type:</strong> Monthly Collection</p>
                  <p><strong>Status:</strong> Active</p>
                </div>
              </div>
              
              <div class="summary">
                <h3>Collection Summary</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <div class="label">Total Expected</div>
                    <div class="value">${currency}${collectionData.reduce((sum: number, item: any) => sum + (item.rentAmount || 0), 0).toLocaleString()}</div>
                  </div>
                  <div class="summary-item">
                    <div class="label">Total Collected</div>
                    <div class="value">${currency}${collectionData.reduce((sum: number, item: any) => sum + (item.paidAmount || 0), 0).toLocaleString()}</div>
                  </div>
                  <div class="summary-item">
                    <div class="label">Outstanding</div>
                    <div class="value">${currency}${collectionData.reduce((sum: number, item: any) => sum + ((item.rentAmount || 0) - (item.paidAmount || 0)), 0).toLocaleString()}</div>
                  </div>
                  <div class="summary-item">
                    <div class="label">Collection Rate</div>
                    <div class="value">${Math.round((collectionData.reduce((sum: number, item: any) => sum + (item.paidAmount || 0), 0) / Math.max(collectionData.reduce((sum: number, item: any) => sum + (item.rentAmount || 0), 0), 1)) * 100)}%</div>
                  </div>
                </div>
              </div>
            
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Tenant Name</th>
                      <th>Property</th>
                      <th>Unit</th>
                      <th>Rent Amount</th>
                      <th>Paid Amount</th>
                      <th>Outstanding</th>
                      <th>Status</th>
                      <th>Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${collectionData.map((item: any) => {
                      const outstanding = (item.rentAmount || 0) - (item.paidAmount || 0);
                      const status = outstanding === 0 ? 'Paid' : outstanding > 0 ? 'Pending' : 'Overpaid';
                      const statusClass = status === 'Paid' ? 'paid' : status === 'Pending' ? 'pending' : 'overdue';
                      
                      return `
                        <tr>
                          <td><strong>${item.tenantName || 'N/A'}</strong></td>
                          <td>${item.propertyName || 'N/A'}</td>
                          <td><strong>${item.unit || 'N/A'}</strong></td>
                          <td><strong>${currency}${(item.rentAmount || 0).toLocaleString()}</strong></td>
                          <td><strong>${currency}${(item.paidAmount || 0).toLocaleString()}</strong></td>
                          <td><strong>${currency}${outstanding.toLocaleString()}</strong></td>
                          <td><span class="status-badge ${statusClass}">${status}</span></td>
                          <td>${item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'Pending'}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            
              <div class="footer">
                <div class="footer-stats">
                  <div class="footer-stat">
                    <div class="number">${collectionData.length}</div>
                    <div class="label">Total Records</div>
                  </div>
                  <div class="footer-stat">
                    <div class="number">${collectionData.filter((item: any) => (item.rentAmount || 0) - (item.paidAmount || 0) === 0).length}</div>
                    <div class="label">Paid</div>
                  </div>
                  <div class="footer-stat">
                    <div class="number">${collectionData.filter((item: any) => (item.rentAmount || 0) - (item.paidAmount || 0) > 0).length}</div>
                    <div class="label">Pending</div>
                  </div>
                  <div class="footer-stat">
                    <div class="number">${Math.round((collectionData.reduce((sum: number, item: any) => sum + (item.paidAmount || 0), 0) / Math.max(collectionData.reduce((sum: number, item: any) => sum + (item.rentAmount || 0), 0), 1)) * 100)}%</div>
                    <div class="label">Collection Rate</div>
                  </div>
                </div>
                
                <div class="branding">
                  <p><strong>Report generated by HNV Property Management Solutions</strong></p>
                  <p>© ${new Date().getFullYear()} HNV Property Management Solutions. All rights reserved.</p>
                  <p>Professional Property Management Software - www.hnvpm.com</p>
                </div>
              </div>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      alert('Collection sheet generated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to generate collection sheet:', error);
      alert('Failed to generate collection sheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Collection Sheet</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Property (Optional)
            </label>
            <div className="relative">
              <Building2 size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Properties</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month and Year Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Collection Sheet will include:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• All tenant payment records</li>
              <li>• Outstanding balances</li>
              <li>• Payment status summary</li>
              <li>• Monthly collection totals</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate Sheet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCollectionSheet;