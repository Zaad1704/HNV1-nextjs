import React, { useState } from 'react';
import { X, Download, FileText, Table, FileImage } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  title: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, section, title }) => {
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { exportData, isExporting } = useDataExport() || { exportData: () => {}, isExporting: false };

  const handleExport = async () => {
    try {
      await exportData(section, `${section}-export`, {
        format,
        dateRange: dateRange.start && dateRange.end ? dateRange : undefined
      });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">Export {title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'xlsx', label: 'Excel', icon: Table },
                { value: 'csv', label: 'CSV', icon: FileText },
                { value: 'pdf', label: 'PDF', icon: FileImage }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value as any)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                    format === option.value
                      ? 'border-orange-400 bg-white/20 text-orange-600'
                      : 'border-white/30 hover:border-white/50 text-gray-700'
                  }`}
                >
                  <option.icon size={20} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="p-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/10 text-gray-700 placeholder-gray-500"
                placeholder="End Date"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-lg hover:from-orange-500 hover:to-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;