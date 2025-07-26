import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { HelpCircle, X, Book, Video, MessageSquare, ExternalLink } from 'lucide-react';


const HelpWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Only show on dashboard pages
  const isDashboardPage = pathname.startsWith('/dashboard');
  
  if (!isDashboardPage) {
    return null;
  }

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Book className="w-5 h-5" />,
      items: [
        { title: 'Dashboard Overview', description: 'Learn about your dashboard and main features', url: '/help/dashboard-overview' },
        { title: 'Adding Your First Property', description: 'Step-by-step guide to add properties', url: '/help/add-property' },
        { title: 'Managing Tenants', description: 'How to add and manage tenant information', url: '/help/manage-tenants' },
        { title: 'Setting Up Payments', description: 'Configure payment methods and tracking', url: '/help/setup-payments' }
      ]
    },
    {
      id: 'features',
      title: 'Key Features',
      icon: <Video className="w-5 h-5" />,
      items: [
        { title: 'Property Management', description: 'Comprehensive property tracking and management', url: '/help/property-management' },
        { title: 'Tenant Portal', description: 'Enable tenants to access their information', url: '/help/tenant-portal' },
        { title: 'Financial Reporting', description: 'Generate reports and track cash flow', url: '/help/financial-reporting' },
        { title: 'Maintenance Requests', description: 'Handle maintenance and repair requests', url: '/help/maintenance-requests' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <MessageSquare className="w-5 h-5" />,
      items: [
        { title: 'Common Issues', description: 'Solutions to frequently encountered problems', url: '/help/common-issues' },
        { title: 'Account Settings', description: 'Manage your account and organization settings', url: '/help/account-settings' },
        { title: 'Billing & Subscriptions', description: 'Understand billing and manage subscriptions', url: '/help/billing' },
        { title: 'Contact Support', description: 'Get help from our support team', url: '/help/contact-support' }
      ]
    }
  ];

  return (
    <>
      {/* Help Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-20 bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-30 group"
          title="Get Help"
        >
          <HelpCircle size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed top-20 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden max-h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle size={20} />
                <h3 className="font-semibold">Help Center</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-6">
                {helpSections.map((section) => (
                  <div key={section.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-green-600 dark:text-green-400">
                        {section.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {section.title}
                      </h4>
                    </div>
                    
                    <div className="space-y-2 ml-7">
                      {section.items.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            // Handle help item click
                            console.log('Help item clicked:', item.url);
                            // You can navigate to help pages or open modals here
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {item.title}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {item.description}
                              </p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0 ml-2 mt-0.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Live Chat</span>
                  </button>
                  <button className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <Video className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Video Tours</span>
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}
    </>
  );
};

export default HelpWidget;