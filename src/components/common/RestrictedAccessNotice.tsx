import React from 'react';
import { Lock, Mail, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface RestrictedAccessNoticeProps {
  type?: 'email' | 'subscription';
  message?: string;
}

const RestrictedAccessNotice: React.FC<RestrictedAccessNoticeProps> = ({ 
  type = 'email', 
  message 
}) => {
  const isEmailRestriction = type === 'email';
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
        {isEmailRestriction ? (
          <Mail className="text-yellow-600" size={24} />
        ) : (
          <CreditCard className="text-yellow-600" size={24} />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        <Lock size={16} className="inline mr-2" />
        Access Restricted
      </h3>
      
      <p className="text-yellow-700 mb-4">
        {message || (isEmailRestriction 
          ? 'Please verify your email address to perform this action.'
          : 'Please renew your subscription to perform this action.'
        )}
      </p>
      
      <Link
        to={isEmailRestriction ? '/dashboard/settings' : '/billing'}
        className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
      >
        {isEmailRestriction ? (
          <>
            <Mail size={16} />
            Verify Email
          </>
        ) : (
          <>
            <CreditCard size={16} />
            Renew Subscription
          </>
        )}
      </Link>
    </div>
  );
};

export default RestrictedAccessNotice;