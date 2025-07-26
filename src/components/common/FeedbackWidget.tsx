import React, { useState } from 'react';
import { MessageSquare, Star, Send, X, ThumbsUp, ThumbsDown, Bot, HelpCircle, Zap } from 'lucide-react';
import { useToast } from './Toast';
import apiClient from '@/lib/api';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  rating: number;
  message: string;
  email?: string;
  page: string;
}

const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'main' | 'rating' | 'details' | 'success' | 'ai-chat' | 'help'>('main');
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    page: window.pathname
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleRating = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.message?.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/feedback', {
        ...feedback,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      setStep('success');
      showToast({
        type: 'success',
        title: 'Feedback Sent!',
        message: 'Thank you for helping us improve.'
      });
      
      setTimeout(() => {
        setIsOpen(false);
        setStep('rating');
        setFeedback({ page: window.pathname });
      }, 2000);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to Send',
        message: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWidget = () => {
    setIsOpen(false);
    setStep('rating');
    setFeedback({ page: window.pathname });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-app-surface border border-app-border text-text-primary p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        aria-label="Send feedback"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 bg-app-surface border border-app-border rounded-3xl shadow-2xl z-50 w-80">
      {/* Header */}
      <div className="p-4 border-b border-app-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-brand-blue" />
          <span className="font-semibold text-text-primary">Feedback</span>
        </div>
        <button
          onClick={resetWidget}
          className="p-1 rounded-full hover:bg-app-bg transition-colors"
          aria-label="Close feedback"
        >
          <X size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {step === 'main' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary text-center mb-4">How can we help?</h3>
            
            <button
              onClick={() => setStep('ai-chat')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-app-border hover:bg-app-bg transition-colors text-left"
            >
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Bot size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-text-primary">AI Assistant</div>
                <div className="text-xs text-text-secondary">Get instant help with AI</div>
              </div>
            </button>

            <button
              onClick={() => setStep('help')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-app-border hover:bg-app-bg transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <HelpCircle size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-text-primary">How to Use App</div>
                <div className="text-xs text-text-secondary">Learn app features</div>
              </div>
            </button>

            <button
              onClick={() => setStep('rating')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-app-border hover:bg-app-bg transition-colors text-left"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-text-primary">Send Feedback</div>
                <div className="text-xs text-text-secondary">Share your thoughts</div>
              </div>
            </button>
          </div>
        )}

        {step === 'ai-chat' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="text-purple-600" />
              <h3 className="font-semibold text-text-primary">AI Assistant</h3>
            </div>
            
            <div className="bg-app-bg rounded-xl p-3 mb-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={12} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm text-text-secondary">
                  Hi! I'm your AI assistant. I can help you with:
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Property management questions</li>
                    <li>• Feature explanations</li>
                    <li>• Troubleshooting issues</li>
                    <li>• Best practices</li>
                  </ul>
                </div>
              </div>
            </div>

            <textarea
              placeholder="Ask me anything about the app..."
              rows={3}
              className="w-full p-2 border border-app-border rounded-xl bg-app-bg text-text-primary resize-none text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setStep('main')}
                className="flex-1 p-2 border border-app-border rounded-xl text-text-secondary hover:bg-app-bg transition-colors text-sm"
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
              <h3 className="font-semibold text-text-primary">How to Use App</h3>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="bg-app-bg rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-yellow-500" />
                  <span className="font-medium text-text-primary text-sm">Quick Start</span>
                </div>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>1. Add your first property</li>
                  <li>2. Invite tenants to their portal</li>
                  <li>3. Set up payment tracking</li>
                  <li>4. Monitor maintenance requests</li>
                </ul>
              </div>

              <div className="bg-app-bg rounded-lg p-3">
                <div className="font-medium text-text-primary text-sm mb-2">Key Features</div>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• Property Management Dashboard</li>
                  <li>• Tenant Portal Access</li>
                  <li>• Payment & Expense Tracking</li>
                  <li>• Maintenance Request System</li>
                  <li>• Financial Reports & Analytics</li>
                </ul>
              </div>

              <div className="bg-app-bg rounded-lg p-3">
                <div className="font-medium text-text-primary text-sm mb-2">Tips & Tricks</div>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• Use keyboard shortcuts for faster navigation</li>
                  <li>• Set up automated reminders</li>
                  <li>• Export data for tax purposes</li>
                  <li>• Enable notifications for important updates</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setStep('main')}
              className="w-full p-2 border border-app-border rounded-xl text-text-secondary hover:bg-app-bg transition-colors text-sm"
            >
              Back to Menu
            </button>
          </div>
        )}

        {step === 'rating' && (
          <div className="text-center">
            <h3 className="font-semibold text-text-primary mb-2">How was your experience?</h3>
            <p className="text-sm text-text-secondary mb-4">Your feedback helps us improve</p>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className="p-2 rounded-full hover:bg-app-bg transition-colors"
                  aria-label={`Rate ${rating} stars`}
                >
                  <Star
                    size={24}
                    className={`${
                      feedback.rating && rating <= feedback.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFeedback(prev => ({ ...prev, rating: 1, type: 'bug' }));
                  setStep('details');
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border border-app-border hover:bg-app-bg transition-colors"
              >
                <ThumbsDown size={16} />
                <span className="text-sm">Report Issue</span>
              </button>
              <button
                onClick={() => {
                  setFeedback(prev => ({ ...prev, rating: 5, type: 'feature' }));
                  setStep('details');
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border border-app-border hover:bg-app-bg transition-colors"
              >
                <ThumbsUp size={16} />
                <span className="text-sm">Suggest Feature</span>
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit}>
            <h3 className="font-semibold text-text-primary mb-3">Tell us more</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Type
              </label>
              <select
                value={feedback.type || 'general'}
                onChange={(e) => setFeedback(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border border-app-border rounded-xl bg-app-bg text-text-primary"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Message *
              </label>
              <textarea
                value={feedback.message || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your feedback..."
                rows={3}
                className="w-full p-2 border border-app-border rounded-xl bg-app-bg text-text-primary resize-none"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={feedback.email || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full p-2 border border-app-border rounded-xl bg-app-bg text-text-primary"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('main')}
                className="flex-1 p-2 border border-app-border rounded-xl text-text-secondary hover:bg-app-bg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !feedback.message?.trim()}
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ThumbsUp size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">Thank you!</h3>
            <p className="text-sm text-text-secondary">Your feedback has been sent successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackWidget;