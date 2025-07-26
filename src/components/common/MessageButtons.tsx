import React, { useState } from 'react';
import { MessageCircle, Send, Mail, Phone, MessageSquare, Video, Users, Camera } from 'lucide-react';
import { openWhatsApp, openTelegram, openSMS, openEmail, openViber, openSkype, openMessenger, openInstagram, messageTemplates } from '@/utils/whatsappHelper';

interface MessageButtonsProps {
  phone?: string;
  email?: string;
  name: string;
  telegram?: string;
  skypeId?: string;
  messengerUserId?: string;
  instagramUsername?: string;
  messageType?: 'rentReminder' | 'paymentConfirmation' | 'maintenanceUpdate' | 'leaseExpiry' | 'teamInvite' | 'welcomeMessage';
  customMessage?: string;
  additionalData?: any;
}

const MessageButtons: React.FC<MessageButtonsProps> = ({
  phone,
  email,
  name,
  telegram,
  skypeId,
  messengerUserId,
  instagramUsername,
  messageType,
  customMessage,
  additionalData = {}
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getMessage = () => {
    if (customMessage) return customMessage;
    
    if (messageType && messageTemplates[messageType]) {
      switch (messageType) {
        case 'rentReminder':
          return messageTemplates.rentReminder(name, additionalData.amount || 0, additionalData.dueDate || '');
        case 'paymentConfirmation':
          return messageTemplates.paymentConfirmation(name, additionalData.amount || 0, additionalData.date || '');
        case 'maintenanceUpdate':
          return messageTemplates.maintenanceUpdate(name, additionalData.status || '', additionalData.description || '');
        case 'leaseExpiry':
          return messageTemplates.leaseExpiry(name, additionalData.expiryDate || '');
        case 'teamInvite':
          return messageTemplates.teamInvite(name, additionalData.role || '', additionalData.companyName || '');
        case 'welcomeMessage':
          return messageTemplates.welcomeMessage(name, additionalData.propertyName || '', additionalData.unitNumber || '');
        default:
          return `Hi ${name}, this is a message from your property management team.`;
      }
    }
    
    return `Hi ${name}, this is a message from your property management team.`;
  };

  const message = getMessage();

  const messageOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => phone && openWhatsApp(phone, message),
      available: !!phone
    },
    {
      name: 'SMS',
      icon: Phone,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => phone && openSMS(phone, message),
      available: !!phone
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => email && openEmail(email, 'Property Management Message', message),
      available: !!email
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => telegram && openTelegram(telegram, message),
      available: !!telegram
    },
    {
      name: 'Viber',
      icon: MessageSquare,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => phone && openViber(phone, message),
      available: !!phone
    },
    {
      name: 'Skype',
      icon: Video,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => skypeId && openSkype(skypeId, message),
      available: !!skypeId
    },
    {
      name: 'Messenger',
      icon: Users,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => messengerUserId && openMessenger(messengerUserId),
      available: !!messengerUserId
    },
    {
      name: 'Instagram',
      icon: Camera,
      color: 'bg-pink-500 hover:bg-pink-600',
      action: () => instagramUsername && openInstagram(instagramUsername),
      available: !!instagramUsername
    }
  ];

  const availableOptions = messageOptions.filter(option => option.available);

  if (availableOptions.length === 0) {
    return null;
  }

  if (availableOptions.length === 1) {
    const option = availableOptions[0];
    return (
      <button
        onClick={option.action}
        className={`${option.color} text-white p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors`}
        title={`Send via ${option.name}`}
      >
        <option.icon size={16} />
        {option.name}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <MessageCircle size={16} />
        Message
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-[150px]">
          {availableOptions.map((option, index) => (
            <button
              key={option.name}
              onClick={() => {
                option.action();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className={`w-8 h-8 ${option.color} rounded-full flex items-center justify-center`}>
                <option.icon size={14} className="text-white" />
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default MessageButtons;