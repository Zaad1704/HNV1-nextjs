import React, { useState } from 'react';
import { X, Download, FileText, Calendar, DollarSign, Users, BarChart3 } from 'lucide-react';

interface PropertyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  tenants: any[];
}

const PropertyReportModal: React.FC<PropertyReportModalProps> = ({
  isOpen,
  onClose,
  property,
  tenants
}) => {
  const [reportType, setReportType] = useState<'financial' | 'occupancy' | 'tenant' | 'comprehensive'>('comprehensive');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      icon: FileText,
      description: 'Complete property overview with all metrics',
      includes: ['Financial summary', 'Occupancy details', 'Tenant information', 'Payment history']
    },
    {
      id: 'financial',
      name: 'Financial Report',
      icon: DollarSign,
      description: 'Revenue, expenses, and financial performance',
      includes: ['Revenue breakdown', 'Payment history', 'Outstanding amounts', 'Profit/Loss']
    },
    {
      id: 'occupancy',
      name: 'Occupancy Report',
      icon: BarChart3,
      description: 'Unit occupancy and vacancy analysis',
      includes: ['Occupancy rates', 'Vacant units', 'Lease expiry dates', 'Turnover analysis']
    },
    {
      id: 'tenant',
      name: 'Tenant Report',
      icon: Users,
      description: 'Detailed tenant information and history',
      includes: ['Tenant profiles', 'Lease details', 'Payment status', 'Contact information']
    }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const activeTenants = tenants.filter(t => t.status === 'Active');
      const totalUnits = property.numberOfUnits || 0;
      const occupiedUnits = activeTenants.length;
      const totalRevenue = activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      
      if (format === 'pdf') {
        generatePDFReport();
      } else if (format === 'excel') {
        generateExcelReport();
      } else if (format === 'csv') {
        generateCSVReport();
      }

      alert('Report generated and downloaded successfully!');
      onClose();
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const generatePDFReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const activeTenants = tenants.filter(t => t.status === 'Active');
    const totalUnits = property.numberOfUnits || 0;
    const occupiedUnits = activeTenants.length;
    const totalRevenue = activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    const reportTypeData = reportTypes.find(t => t.id === reportType);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTypeData?.name} - ${property.name}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; padding: 20px; line-height: 1.6; color: #333;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; padding: 30px; border-radius: 10px;
              margin-bottom: 30px; text-align: center;
            }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .header h2 { font-size: 22px; margin-bottom: 15px; }
            .summary {
              display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px; margin: 20px 0;
            }
            .summary-card {
              background: #f8f9fa; padding: 20px; border-radius: 8px;
              border-left: 4px solid #667eea; text-align: center;
            }
            .summary-card .number { font-size: 24px; font-weight: bold; color: #667eea; }
            .summary-card .label { font-size: 12px; color: #666; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; padding: 15px 12px; text-align: left;
              font-size: 13px; font-weight: 600;
            }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
            tr:nth-child(even) { background-color: #fafafa; }
            .status-badge {
              padding: 4px 8px; border-radius: 12px; font-size: 11px;
              font-weight: bold; text-transform: uppercase;
            }
            .active { background: #d4edda; color: #155724; }
            .inactive { background: #f8d7da; color: #721c24; }
            .footer {
              margin-top: 40px; padding: 20px; background: #f8f9fa;
              border-radius: 8px; text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${property.name}</h1>
            <h2>${reportTypeData?.name}</h2>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <div class="number">${totalUnits}</div>
              <div class="label">Total Units</div>
            </div>
            <div class="summary-card">
              <div class="number">${occupiedUnits}</div>
              <div class="label">Occupied Units</div>
            </div>
            <div class="summary-card">
              <div class="number">${occupancyRate.toFixed(1)}%</div>
              <div class="label">Occupancy Rate</div>
            </div>
            <div class="summary-card">
              <div class="number">$${totalRevenue.toLocaleString()}</div>
              <div class="label">Monthly Revenue</div>
            </div>
          </div>
          
          ${reportType === 'tenant' || reportType === 'comprehensive' ? `
            <h3>Tenant Information</h3>
            <table>
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Unit</th>
                  <th>Rent Amount</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                ${tenants.map(tenant => `
                  <tr>
                    <td><strong>${tenant.name}</strong></td>
                    <td>${tenant.unit || 'N/A'}</td>
                    <td><strong>$${(tenant.rentAmount || 0).toLocaleString()}</strong></td>
                    <td><span class="status-badge ${tenant.status === 'Active' ? 'active' : 'inactive'}">${tenant.status}</span></td>
                    <td>${tenant.email || 'N/A'}</td>
                    <td>${tenant.phone || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          <div class="footer">
            <p><strong>Report generated by HNV Property Management Solutions</strong></p>
            <p>© ${new Date().getFullYear()} HNV Property Management Solutions. All rights reserved.</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const generateExcelReport = () => {
    const activeTenants = tenants.filter(t => t.status === 'Active');
    const totalUnits = property.numberOfUnits || 0;
    const occupiedUnits = activeTenants.length;
    const totalRevenue = activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    
    // Create CSV content that Excel can open
    const csvContent = [
      [`${reportTypes.find(t => t.id === reportType)?.name} - ${property.name}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`],
      [],
      ['SUMMARY'],
      ['Total Units', totalUnits],
      ['Occupied Units', occupiedUnits],
      ['Occupancy Rate', `${((occupiedUnits / Math.max(totalUnits, 1)) * 100).toFixed(1)}%`],
      ['Monthly Revenue', `$${totalRevenue.toLocaleString()}`],
      [],
      ['TENANT DETAILS'],
      ['Tenant Name', 'Unit', 'Rent Amount', 'Status', 'Email', 'Phone'],
      ...tenants.map(tenant => [
        tenant.name,
        tenant.unit || 'N/A',
        `$${(tenant.rentAmount || 0).toLocaleString()}`,
        tenant.status,
        tenant.email || 'N/A',
        tenant.phone || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${property.name}_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    const csvContent = [
      ['Tenant Name', 'Unit', 'Rent Amount', 'Status', 'Email', 'Phone', 'Lease Start', 'Lease End'],
      ...tenants.map(tenant => [
        tenant.name,
        tenant.unit || 'N/A',
        (tenant.rentAmount || 0).toString(),
        tenant.status,
        tenant.email || 'N/A',
        tenant.phone || 'N/A',
        tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toLocaleDateString() : 'N/A',
        tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${property.name}_${reportType}_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">Generate Property Report</h2>
              <p className="text-sm text-gray-700">{property.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Select Report Type</h3>
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      reportType === type.id
                        ? 'border-orange-400 bg-white/20'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.id}
                      checked={reportType === type.id}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <type.icon size={20} className="text-orange-500 mt-1" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">{type.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{type.description}</div>
                        <div className="text-xs text-gray-600">
                          Includes: {type.includes.join(', ')}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Export Format</h3>
              <div className="flex gap-3">
                {[
                  { id: 'pdf', name: 'PDF', description: 'Formatted document' },
                  { id: 'excel', name: 'Excel', description: 'Spreadsheet format' },
                  { id: 'csv', name: 'CSV', description: 'Data export' }
                ].map((fmt) => (
                  <label
                    key={fmt.id}
                    className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                      format === fmt.id
                        ? 'border-orange-400 bg-white/20'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={fmt.id}
                      checked={format === fmt.id}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="font-medium text-gray-700">{fmt.name}</div>
                    <div className="text-xs text-gray-600">{fmt.description}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Report Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium ml-2 text-gray-700">{property.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium ml-2 text-gray-700">{reportTypes.find(t => t.id === reportType)?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium ml-2 text-gray-700">
                    {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium ml-2 text-gray-700">{format.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-lg hover:from-orange-500 hover:to-blue-500 disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={16} />
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyReportModal;