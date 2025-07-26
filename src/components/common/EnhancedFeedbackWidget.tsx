import React, { useState } from 'react';
import { MessageSquare, Star, Send, X, ThumbsUp, ThumbsDown, Bot, HelpCircle, Zap } from 'lucide-react';
import { useToast } from './Toast';
import apiClient from '@/lib/api';

const EnhancedFeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'main' | 'rating' | 'details' | 'success' | 'ai-chat' | 'help'>('main');
  const [feedback, setFeedback] = useState({ page: window.pathname });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/feedback', feedback);
      setStep('success');
      showToast({ type: 'success', title: 'Feedback Sent!', message: 'Thank you for helping us improve.' });
      setTimeout(() => {
        setIsOpen(false);
        setStep('main');
        setFeedback({ page: window.pathname });
      }, 2000);
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to Send', message: 'Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 opacity-80 hover:opacity-100"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 w-80">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-white">Support Center</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        {step === 'main' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-center mb-4">How can we help?</h3>
            
            <button
              onClick={() => setStep('ai-chat')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Bot size={16} className="text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">AI Assistant</div>
                <div className="text-xs text-gray-500">Get instant help with AI</div>
              </div>
            </button>

            <button
              onClick={() => setStep('help')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <HelpCircle size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">How to Use App</div>
                <div className="text-xs text-gray-500">Learn app features</div>
              </div>
            </button>

            <button
              onClick={() => setStep('rating')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare size={16} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Send Feedback</div>
                <div className="text-xs text-gray-500">Share your thoughts</div>
              </div>
            </button>
          </div>
        )}

        {step === 'ai-chat' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-3">
              <div className="flex items-start gap-2">
                <Bot size={16} className="text-purple-600 mt-1" />
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Hi! I can help you with property management, features, troubleshooting, and best practices.
                </div>
              </div>
            </div>

            <textarea
              placeholder="Ask me anything about the app..."
              rows={3}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setStep('main')}
                className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Back
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm">
                <Send size={14} />
                Ask AI
              </button>
            </div>
          </div>
        )}

        {step === 'help' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle size={16} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">How to Use App</h3>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white text-sm">Quick Start</span>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>1. Add your first property</li>
                  <li>2. Invite tenants to their portal</li>
                  <li>3. Set up payment tracking</li>
                  <li>4. Monitor maintenance requests</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="font-medium text-gray-900 dark:text-white text-sm mb-2">Key Features</div>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Property Management Dashboard</li>
                  <li>• Tenant Portal Access</li>
                  <li>• Payment & Expense Tracking</li>
                  <li>• Maintenance Request System</li>
                  <li>• Financial Reports & Analytics</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setStep('main')}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Back to Menu
            </button>
          </div>
        )}

        {step === 'rating' && (
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How was your experience?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(rating => (
                <button key={rating} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Star size={24} className="text-gray-300 hover:text-yellow-400" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('main')}
                className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400"
              >
                Back
              </button>
              <button className="flex-1 p-2 bg-blue-600 text-white rounded-xl">Continue</button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <ThumbsUp size={24} className="text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Thank you!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your feedback has been sent.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFeedbackWidget;