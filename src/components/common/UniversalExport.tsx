import React, { useState } from 'react';
import { Download, FileText, Table, Image, X } from 'lucide-react';
import { SearchFilters } from './UniversalSearch';

interface UniversalExportProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  filename: string;
  filters?: SearchFilters;
  title?: string;
  organizationName?: string;
}

const UniversalExport: React.FC<UniversalExportProps> = ({
  isOpen,
  onClose,
  data,
  filename,
  filters,
  title = "Export Data",
  organizationName = "Your Organization"
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const cleanData = data.map(item => {
      const cleanItem: any = {};
      Object.keys(item).forEach(key => {
        if (item[key] && typeof item[key] === 'object' && item[key].formattedAddress) {
          cleanItem[key] = item[key].formattedAddress;
        } else if (item[key] && typeof item[key] === 'object') {
          cleanItem[key] = JSON.stringify(item[key]);
        } else {
          cleanItem[key] = item[key] || '';
        }
      });
      return cleanItem;
    });
    
    const headers = Object.keys(cleanData[0]);
    const csvContent = [
      `"${organizationName} - ${title}"`,
      `"Generated on: ${new Date().toLocaleDateString()}"`,
      `"Powered by HNV Property Management Solutions"`,
      '',
      headers.join(','),
      ...cleanData.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      ),
      '',
      `"Total Records: ${cleanData.length}"`,
      `"Powered by HNV Property Management Solutions"`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const cleanData = data.map(item => {
      const cleanItem: any = {};
      Object.keys(item).forEach(key => {
        if (item[key] && typeof item[key] === 'object' && item[key].formattedAddress) {
          cleanItem[key] = item[key].formattedAddress;
        } else if (item[key] && typeof item[key] === 'object') {
          cleanItem[key] = JSON.stringify(item[key]);
        } else {
          cleanItem[key] = item[key] || '';
        }
      });
      return cleanItem;
    });
    
    const headers = Object.keys(cleanData[0]);
    const htmlTable = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${organizationName}</h2>
            <h3>${title}</h3>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Powered by HNV Property Management Solutions</p>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${cleanData.map(row => 
                `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Total Records: ${cleanData.length}</p>
            <p>Powered by HNV Property Management Solutions</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: any[], filename: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cleanData = data.map(item => {
      const cleanItem: any = {};
      Object.keys(item).forEach(key => {
        if (item[key] && typeof item[key] === 'object' && item[key].formattedAddress) {
          cleanItem[key] = item[key].formattedAddress;
        } else if (item[key] && typeof item[key] === 'object') {
          cleanItem[key] = JSON.stringify(item[key]);
        } else {
          cleanItem[key] = item[key] || '';
        }
      });
      return cleanItem;
    });

    const headers = cleanData.length ? Object.keys(cleanData[0]) : [];
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .footer { text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #333; margin: 0; }
            .filters { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #007cba; }
            .meta { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${organizationName}</h1>
            <h2 style="color: #666; margin: 10px 0;">${title}</h2>
            <p class="meta">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p class="meta"><strong>Powered by HNV Property Management Solutions</strong></p>
          </div>
          
          ${includeFilters && filters ? `
            <div class="filters">
              <strong>Applied Filters:</strong><br>
              ${filters.query ? `Search: "${filters.query}"<br>` : ''}
              ${filters.dateRange !== 'all' ? `Date Range: ${filters.dateRange}<br>` : ''}
              ${filters.status ? `Status: ${filters.status}<br>` : ''}
            </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${cleanData.map(row => 
                `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p><strong>Total Records: ${cleanData.length}</strong></p>
            <p>Report generated by HNV Property Management Solutions</p>
            <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} HNV Property Management Solutions. All rights reserved.</p>
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
  };

  const handleExport = async () => {
    setIsExporting(true);
    setIsLoading(true);
    
    try {
      // Data is already cleaned in individual export functions
      const exportData = data;

      const timestamp = new Date().toISOString().split('T')[0];
      const exportFilename = `${filename}_${timestamp}`;

      switch (exportFormat) {
        case 'csv':
          exportToCSV(exportData, exportFilename);
          break;
        case 'excel':
          exportToExcel(exportData, exportFilename);
          break;
        case 'pdf':
          exportToPDF(exportData, exportFilename);
          break;
      }

      alert(`Data exported successfully as ${exportFormat.toUpperCase()}!`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close export modal"
            disabled={isExporting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Exporting {data.length} records
            </p>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'excel', label: 'Excel', icon: Table },
                { value: 'csv', label: 'CSV', icon: FileText },
                { value: 'pdf', label: 'PDF', icon: Image }
              ].map(format => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as any)}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <format.icon size={20} />
                  <span className="text-sm font-medium">{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeFilters}
                onChange={(e) => setIncludeFilters(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Include applied filters in export</span>
            </label>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isExporting}
              aria-label="Cancel export"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || data.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalExport;