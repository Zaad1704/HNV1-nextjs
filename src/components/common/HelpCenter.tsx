import React, { useState } from 'react';
import { HelpCircle, Search, Book, MessageCircle, Mail, X } from 'lucide-react';


interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpCenter: React.FC = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add a new property?',
      answer: 'Go to Dashboard > Properties > Add New Property. Fill in the required information including property name, address, and number of units.',
      category: 'properties'
    },
    {
      id: '2',
      question: 'How do I record a payment?',
      answer: 'Navigate to Dashboard > Payments > Record Payment. Select the tenant, enter the amount, and choose the payment method.',
      category: 'payments'
    },
    {
      id: '3',
      question: 'How do I invite users to my organization?',
      answer: 'Go to Dashboard > Users & Invites > Invite User. Enter their email address and select their role (Agent or Tenant).',
      category: 'users'
    },
    {
      id: '4',
      question: 'How do I change my language preference?',
      answer: 'Use the language switcher in the top navigation bar. Your preference will be saved automatically.',
      category: 'settings'
    },
    {
      id: '5',
      question: 'How do I generate financial reports?',
      answer: 'Visit Dashboard > Analytics to view comprehensive financial reports and export data as needed.',
      category: 'reports'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'properties', name: 'Properties', icon: HelpCircle },
    { id: 'payments', name: 'Payments', icon: HelpCircle },
    { id: 'users', name: 'Users', icon: HelpCircle },
    { id: 'settings', name: 'Settings', icon: HelpCircle },
    { id: 'reports', name: 'Reports', icon: HelpCircle }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-blue text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        aria-label="Open help center"
      >
        <HelpCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-app-surface rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
              <HelpCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Help Center</h2>
              <p className="text-text-secondary">Find answers to common questions</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-app-bg transition-colors"
            aria-label="Close help center"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-app-border p-4">
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
                    activeCategory === category.id
                      ? 'bg-brand-blue text-white'
                      : 'text-text-secondary hover:bg-app-bg'
                  }`}
                >
                  <category.icon size={16} />
                  {category.name}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-app-border">
              <h3 className="font-semibold text-text-primary mb-3">Need More Help?</h3>
              <div className="space-y-2">
                <a
                  href="mailto:support@hnv.com"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-blue transition-colors"
                >
                  <Mail size={14} />
                  Email Support
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-blue transition-colors"
                >
                  <MessageCircle size={14} />
                  Live Chat
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-app-border rounded-2xl bg-app-bg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>

            {/* FAQ List */}
            <div className="space-y-4 overflow-y-auto">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle size={48} className="text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No results found</h3>
                  <p className="text-text-secondary">Try adjusting your search or browse by category</p>
                </div>
              ) : (
                filteredFAQs.map(faq => (
                  <div key={faq.id} className="border border-app-border rounded-2xl p-4">
                    <h3 className="font-semibold text-text-primary mb-2">{faq.question}</h3>
                    <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;