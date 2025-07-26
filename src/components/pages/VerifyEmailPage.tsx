'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const { data } = await apiClient.get(`/auth/verify-email/${verificationToken}`);
      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard', { replace: true });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { delay: 0.3, type: "spring", stiffness: 200, damping: 10 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-6"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        >
          {status === 'loading' && (
            <div className="w-16 h-16 mx-auto">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={32} />
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="text-red-600" size={32} />
            </div>
          )}
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'loading' && 'Verifying Your Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="text-gray-600 mb-6">
          {status === 'loading' && 'Please wait while we verify your email address.'}
          {message}
        </p>

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-green-800 text-sm">
                🎉 Welcome to HNV Property Management! You now have full access to your dashboard.
              </p>
            </div>
            
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in 3 seconds...
            </p>
            
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-800 text-sm">
                The verification link may be expired or invalid. Please try requesting a new one.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Login
              </Link>
              
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Mail size={16} />
                Request New Link
              </Link>
            </div>
          </motion.div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-600 rounded-lg flex items-center justify-center">
              <img src="/logo-min.png" alt="HNV" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-sm font-semibold">HNV Property Management</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;