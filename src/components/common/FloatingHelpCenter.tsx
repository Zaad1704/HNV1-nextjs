import React, { useState } from 'react';
import { HelpCircle, X, MessageCircle, Book, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingHelpCenter = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all"
      >
        <HelpCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Help Center</h3>
                <button onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <a href="/help" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <Book size={20} className="text-blue-500" />
                  <span>Documentation</span>
                </a>
                <a href="/contact" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <MessageCircle size={20} className="text-green-500" />
                  <span>Contact Support</span>
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <Phone size={20} className="text-purple-500" />
                  <span>Call Support</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingHelpCenter;