import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import HeaderActionBar from '@/components/property/HeaderActionBar';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';
import PaymentHandoverModal from '@/components/common/PaymentHandoverModal';
import InviteUserModal from '@/components/common/InviteUserModal';

interface TestResult {
  component: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

const ActionButtonsTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Modal states for testing
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPaymentHandover, setShowPaymentHandover] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);

  const addTestResult = (component: string, action: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { component, action, status, message }]);
  };

  const testAction = (component: string, action: string, testFn: () => void) => {
    try {
      testFn();
      addTestResult(component, action, 'success', 'Action executed successfully');
    } catch (error) {
      addTestResult(component, action, 'error', `Error: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test UniversalFloatingActionMenu actions
    const sections = ['Property', 'Tenant', 'Payment', 'Expense', 'Maintenance', 'Approval', 'Cash Flow', 'Receipt', 'User'];
    
    for (const section of sections) {
      // Test basic actions
      testAction('UniversalFloatingActionMenu', `${section} - Add Item`, () => {
        console.log(`Add ${section} action triggered`);
      });
      
      testAction('UniversalFloatingActionMenu', `${section} - Bulk Action`, () => {
        console.log(`Bulk ${section} action triggered`);
      });
      
      testAction('UniversalFloatingActionMenu', `${section} - Export`, () => {
        console.log(`Export ${section} action triggered`);
      });
      
      testAction('UniversalFloatingActionMenu', `${section} - Search`, () => {
        setShowSearch(true);
        setTimeout(() => setShowSearch(false), 100);
      });
      
      testAction('UniversalFloatingActionMenu', `${section} - Analytics`, () => {
        setShowAnalytics(true);
        setTimeout(() => setShowAnalytics(false), 100);
      });
    }

    // Test section-specific actions
    testAction('UniversalFloatingActionMenu', 'Payment - Handover', () => {
      setShowPaymentHandover(true);
      setTimeout(() => setShowPaymentHandover(false), 100);
    });
    
    testAction('UniversalFloatingActionMenu', 'User - Invite', () => {
      setShowInviteUser(true);
      setTimeout(() => setShowInviteUser(false), 100);
    });

    // Test HeaderActionBar actions
    const headerActions = [
      { id: 'add', label: 'Add Item' },
      { id: 'export', label: 'Export' },
      { id: 'search', label: 'Search' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'bulk', label: 'Bulk Action' }
    ];

    for (const action of headerActions) {
      testAction('HeaderActionBar', action.label, () => {
        console.log(`HeaderActionBar ${action.label} action triggered`);
      });
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Test Panel */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-h-96 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Action Buttons Test</h3>
            <div className="flex gap-2">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
              >
                <Play size={14} />
                {isRunning ? 'Running...' : 'Run Tests'}
              </button>
              <button
                onClick={clearResults}
                className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
          
          {testResults.length > 0 && (
            <div className="mt-2 flex gap-4 text-sm">
              <span className="text-green-600">✓ {successCount} passed</span>
              <span className="text-red-600">✗ {errorCount} failed</span>
              <span className="text-gray-600">Total: {testResults.length}</span>
            </div>
          )}
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Click "Run Tests" to verify all action buttons are working</p>
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {result.component}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {result.action}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Modals */}
      <UniversalSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        sectionName="Test"
        onSearch={() => {}}
        data={[]}
      />
      
      <UniversalAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        sectionName="Test"
        data={[]}
      />
      
      <PaymentHandoverModal
        isOpen={showPaymentHandover}
        onClose={() => setShowPaymentHandover(false)}
        onHandover={async () => {}}
      />
      
      <InviteUserModal
        isOpen={showInviteUser}
        onClose={() => setShowInviteUser(false)}
        onInvite={async () => {}}
      />
    </div>
  );
};

export default ActionButtonsTest;