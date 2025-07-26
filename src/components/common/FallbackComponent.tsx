import React from 'react';

interface FallbackComponentProps {
  componentName: string;
  error?: Error;
}

const FallbackComponent: React.FC<FallbackComponentProps> = ({ componentName, error }) => {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-yellow-800 font-medium">Component Loading Issue</h3>
      <p className="text-yellow-700 text-sm mt-1">
        {componentName} is temporarily unavailable.
      </p>
      {error && (
        <details className="mt-2">
          <summary className="text-xs text-yellow-600 cursor-pointer">Error Details</summary>
          <pre className="text-xs text-yellow-600 mt-1 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
};

export default FallbackComponent;