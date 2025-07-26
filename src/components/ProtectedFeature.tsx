import React from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import SubscriptionPopup from './common/SubscriptionPopup';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
  showPopup?: boolean;
}

const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  children,
  feature,
  fallback,
  showPopup = true
}) => {
  const { 
    subscriptionStatus, 
    loading, 
    showPopup: shouldShowPopup, 
    hidePopup, 
    isFeatureAllowed,
    isDashboardOnly 
  } = useSubscriptionStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show popup if needed
  const displayPopup = showPopup && shouldShowPopup && subscriptionStatus;

  // Check if feature is allowed
  const allowed = feature ? isFeatureAllowed(feature) : !isDashboardOnly;

  if (!allowed) {
    if (fallback) {
      return (
        <>
          {fallback}
          {displayPopup && (
            <SubscriptionPopup
              userStatus={subscriptionStatus!.userStatus}
              subscriptionStatus={subscriptionStatus!.status}
              onClose={hidePopup}
            />
          )}
        </>
      );
    }

    return (
      <>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <div className="text-yellow-600 dark:text-yellow-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Subscription Required
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This feature requires an active subscription. Upgrade your plan to access this functionality.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            View Plans
          </button>
        </div>
        {displayPopup && (
          <SubscriptionPopup
            userStatus={subscriptionStatus!.userStatus}
            subscriptionStatus={subscriptionStatus!.status}
            onClose={hidePopup}
          />
        )}
      </>
    );
  }

  return (
    <>
      {children}
      {displayPopup && (
        <SubscriptionPopup
          userStatus={subscriptionStatus!.userStatus}
          subscriptionStatus={subscriptionStatus!.status}
          onClose={hidePopup}
        />
      )}
    </>
  );
};

export default ProtectedFeature;