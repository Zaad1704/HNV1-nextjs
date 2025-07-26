import React, { useState } from 'react';
import { DollarSign, Printer, Download, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnhancedPaymentDetailsActionWheelProps {
  onDownloadReceipt: () => void;
  onPrintReceipt: () => void;
  onGeneratePdf: () => void;
  tenantId?: string;
  propertyId?: string;
}

const EnhancedPaymentDetailsActionWheel: React.FC<EnhancedPaymentDetailsActionWheelProps> = ({
  onDownloadReceipt,
  onPrintReceipt,
  onGeneratePdf,
  tenantId,
  propertyId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
        aria-label="Payment Actions"
      >
        <DollarSign size={20} className="text-white" />
      </button>

      {/* Simplified Radial Menu */}
      {isOpen && (
        <div className="absolute z-50">
          {/* Download Receipt */}
          <button
            onClick={() => {
              onDownloadReceipt();
              setIsOpen(false);
            }}
            className="absolute -top-12 -left-12 w-10 h-10 rounded-full bg-green-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
            aria-label="Download Receipt"
          >
            <Download size={16} className="text-white" />
          </button>

          {/* Generate PDF */}
          <button
            onClick={() => {
              onGeneratePdf();
              setIsOpen(false);
            }}
            className="absolute -top-16 left-0 w-10 h-10 rounded-full bg-blue-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
            aria-label="Generate PDF"
          >
            <FileText size={16} className="text-white" />
          </button>

          {/* Print Receipt */}
          <button
            onClick={() => {
              onPrintReceipt();
              setIsOpen(false);
            }}
            className="absolute -left-16 top-0 w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
            aria-label="Print Receipt"
          >
            <Printer size={16} className="text-white" />
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default EnhancedPaymentDetailsActionWheel;