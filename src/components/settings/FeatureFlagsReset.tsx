import React from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const FeatureFlagsReset: React.FC = () => {
  const { resetFlags } = useFeatureFlags();

  return (
    <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 mb-6">
      <h3 className="text-lg font-semibold text-white mb-2">Feature Flags Troubleshooting</h3>
      <p className="text-white/80 mb-4">
        If some universal pages are not working correctly, you can reset the feature flags to their default values.
      </p>
      <button
        onClick={resetFlags}
        className="px-4 py-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Reset Feature Flags
      </button>
    </div>
  );
};

export default FeatureFlagsReset;