import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, FileText, Camera } from 'lucide-react';
import UnitConditionReportModal from '@/components/property/UnitConditionReportModal';

interface TenantOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: any;
  unit: any;
  property: any;
  onComplete: () => void;
}

const TenantOnboardingWizard: React.FC<TenantOnboardingWizardProps> = ({
  isOpen,
  onClose,
  tenant,
  unit,
  property,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showConditionReport, setShowConditionReport] = useState(false);
  const [conditionReportCompleted, setConditionReportCompleted] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Welcome & Overview',
      description: 'Introduction and checklist overview'
    },
    {
      id: 2,
      title: 'Unit Condition Report',
      description: 'Document unit condition at move-in'
    },
    {
      id: 3,
      title: 'Keys & Access',
      description: 'Key handover and access setup'
    },
    {
      id: 4,
      title: 'Utilities & Services',
      description: 'Utility setup and service information'
    },
    {
      id: 5,
      title: 'Final Checklist',
      description: 'Complete onboarding process'
    }
  ];

  const handleStepComplete = (stepId: number) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleConditionReportSave = (reportData: any) => {
    console.log('Move-in condition report saved:', reportData);
    setConditionReportCompleted(true);
    handleStepComplete(2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to {property.name}!
              </h3>
              <p className="text-gray-600 mb-6">
                Hello {tenant.name}, we're excited to have you as our new tenant in Unit {unit.unitNumber}.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">Onboarding Checklist</h4>
              <div className="space-y-3">
                {steps.map(step => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      completedSteps.has(step.id) 
                        ? 'bg-green-500 text-white' 
                        : step.id === currentStep 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {completedSteps.has(step.id) ? <CheckCircle size={14} /> : step.id}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => handleStepComplete(1)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              Let's Get Started
              <ArrowRight size={16} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unit Condition Report</h3>
              <p className="text-gray-600">
                Let's document the current condition of your unit for your protection and ours.
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Why is this important?</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Protects your security deposit</li>
                <li>• Documents existing conditions</li>
                <li>• Prevents disputes at move-out</li>
                <li>• Required for lease activation</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConditionReport(true)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Start Condition Report
              </button>
              {conditionReportCompleted && (
                <button
                  onClick={() => handleStepComplete(2)}
                  className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
                >
                  Continue
                </button>
              )}
            </div>
            
            {conditionReportCompleted && (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={24} />
                <p className="text-green-800 font-medium">Condition report completed!</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Keys & Access</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Keys Provided</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Main door key</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Mailbox key</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Building access card/fob</span>
                  </label>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Access Information</h4>
                <p className="text-sm text-gray-600 mb-2">Building entry code: <strong>1234#</strong></p>
                <p className="text-sm text-gray-600">Parking space: <strong>Unit {unit.unitNumber}</strong></p>
              </div>
            </div>
            
            <button
              onClick={() => handleStepComplete(3)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              Keys Received & Understood
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Utilities & Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Utilities to Set Up</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Electricity</span>
                    <span className="text-blue-600">Contact: (555) 123-4567</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas</span>
                    <span className="text-blue-600">Contact: (555) 234-5678</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Internet</span>
                    <span className="text-blue-600">Multiple providers available</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Included Services</h4>
                <div className="space-y-2 text-sm">
                  <div>✓ Water & Sewer</div>
                  <div>✓ Trash Collection</div>
                  <div>✓ Building Maintenance</div>
                  <div>✓ Snow Removal</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleStepComplete(4)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
            >
              Information Received
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="mx-auto text-green-600" size={64} />
            <h3 className="text-2xl font-bold text-gray-900">Welcome Home!</h3>
            <p className="text-gray-600">
              Congratulations! You've completed the onboarding process for Unit {unit.unitNumber}.
            </p>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4">What's Next?</h4>
              <div className="space-y-2 text-sm text-green-800">
                <div>• Your lease is now active</div>
                <div>• First rent payment is due on the 1st</div>
                <div>• Emergency contact: (555) 999-0000</div>
                <div>• Online portal access will be sent via email</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
            >
              Complete Onboarding
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tenant Onboarding</h2>
                <p className="text-sm text-gray-600">
                  Step {currentStep} of {steps.length}: {steps.find(s => s.id === currentStep)?.title}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Progress</span>
                <span>{Math.round((completedSteps.size / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-96">
            {renderStepContent()}
          </div>

          {currentStep > 1 && currentStep < 5 && (
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              
              {completedSteps.has(currentStep) && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <UnitConditionReportModal
        isOpen={showConditionReport}
        onClose={() => setShowConditionReport(false)}
        type="move-in"
        unitNumber={unit.unitNumber}
        tenantName={tenant.name}
        propertyName={property.name}
        onSave={handleConditionReportSave}
      />
    </>
  );
};

export default TenantOnboardingWizard;