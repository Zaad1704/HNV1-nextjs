import React, { useState } from 'react';
import { Copy, Eye, EyeOff, Building } from 'lucide-react';

interface OrganizationCodeProps {
  organizationId: string;
  organizationName: string;
  className?: string;
}

const OrganizationCode: React.FC<OrganizationCodeProps> = ({ 
  organizationId, 
  organizationName, 
  className = '' 
}) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organizationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Building size={16} className="text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900">Organization Code</h4>
          <p className="text-sm text-blue-700">{organizationName}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 font-mono text-sm">
          {showCode ? organizationId : '••••••••••••••••'}
        </div>
        <button
          onClick={() => setShowCode(!showCode)}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          title={showCode ? 'Hide code' : 'Show code'}
        >
          {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          onClick={handleCopy}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          title="Copy code"
        >
          <Copy size={16} />
        </button>
      </div>
      
      {copied && (
        <p className="text-xs text-green-600 mt-2">✓ Code copied to clipboard</p>
      )}
      
      <p className="text-xs text-blue-600 mt-2">
        Share this code with agents and tenants to join your organization
      </p>
    </div>
  );
};

export default OrganizationCode;