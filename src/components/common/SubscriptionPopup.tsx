import React, { useState, useEffect } from 'react';
import { X, Crown, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SubscriptionPopupProps {
  userStatus: 'no_subscription' | 'expired' | 'inactive' | 'trial_expired';
  subscriptionStatus?: string;
  onClose?: () => void;
  autoShow?: boolean;
}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({
  userStatus,
  subscriptionStatus,
  onClose,
  autoShow = true
}) => {
  const [isVisible, setIsVisible] = useState(autoShow);
  const router = useRouter();

  const getPopupContent = () => {
    switch (userStatus) {
      case 'no_subscription':
        return {
          icon: <Crown className="w-12 h-12 text-yellow-500" />,
          title: 'Subscription Required',
          message: 'You need an active subscription to access all features. Subscribe now to unlock the full potential of HNV1.',
          buttonText: 'Subscribe Now',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'expired':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          title: 'Subscription Expired',
          message: 'Your subscription has expired. Renew now to continue using all features.',
          buttonText: 'Renew Subscription',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'inactive':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
          title: 'Subscription Inactive',
          message: 'Your subscription is currently inactive. Please subscribe to access full features.',
          buttonText: 'Activate Subscription',
          buttonColor: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'trial_expired':
        return {
          icon: <Clock className="w-12 h-12 text-purple-500" />,
          title: 'Trial Period Ended',
          message: 'Your free trial has ended. Subscribe now to continue using all features.',
          buttonText: 'Subscribe Now',
          buttonColor: 'bg-purple-600 hover:bg-purple-700'
        };
      default:
        return {
          icon: <Crown className="w-12 h-12 text-blue-500" />,
          title: 'Subscription Required',
          message: 'Please subscribe to access this feature.',
          buttonText: 'Subscribe',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const content = getPopupContent();

  const handleSubscribe = () => {
    router.push('/pricing');
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleDashboardOnly = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {content.icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {content.title}
            </h2>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {content.message}
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSubscribe}
                className={`w-full ${content.buttonColor} text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {content.buttonText}
              </button>
              
              <button
                onClick={handleDashboardOnly}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Continue with Limited Access
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              You can still view your dashboard with limited functionality
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionPopup;