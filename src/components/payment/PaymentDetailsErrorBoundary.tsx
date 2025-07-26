import React, { Component, ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class PaymentDetailsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Payment Details Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div className="text-center p-8 rounded-3xl border border-white/20 max-w-md w-full" style={{
            background: 'rgba(0, 0, 0, 0.3)', 
            backdropFilter: 'blur(10px)'
          }}>
            <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              Payment Details Error
            </h2>
            
            <p className="text-white/80 mb-6">
              Something went wrong while loading the payment details. This might be a temporary issue.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Link 
                to="/dashboard/payments"
                className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
              >
                <ArrowLeft size={16} />
                Back to Payments
              </Link>
              
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-blue-500/50 hover:bg-blue-500/70 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
            </div>
            
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-white/70 text-sm cursor-pointer">
                  Error Details
                </summary>
                <pre className="text-white/60 text-xs mt-2 p-2 bg-black/30 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentDetailsErrorBoundary;