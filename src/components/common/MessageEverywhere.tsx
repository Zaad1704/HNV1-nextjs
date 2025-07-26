import React from 'react';
import MessageButtons from './MessageButtons';
import ShareButton from './ShareButton';

interface MessageEverywhereProps {
  data: any;
  type: 'property' | 'tenant' | 'payment' | 'maintenance' | 'user' | 'general';
  phone?: string;
  email?: string;
  name: string;
  messageType?: string;
  additionalData?: any;
  showShare?: boolean;
  className?: string;
}

const MessageEverywhere: React.FC<MessageEverywhereProps> = ({
  data,
  type,
  phone,
  email,
  name,
  messageType,
  additionalData = {},
  showShare = true,
  className = ''
}) => {
  const getShareText = () => {
    switch (type) {
      case 'property':
        return `Check out this property: ${name} - ${data.address?.formattedAddress || ''}`;
      case 'tenant':
        return `Tenant information for ${name} at ${data.propertyId?.name || 'Property'}`;
      case 'payment':
        return `Payment record for ${name} - $${data.amount || 0}`;
      case 'maintenance':
        return `Maintenance request: ${data.description || name}`;
      case 'user':
        return `User profile: ${name} - ${data.role || 'Team Member'}`;
      default:
        return `Information about ${name}`;
    }
  };

  const getMessageType = () => {
    if (messageType) return messageType;
    
    switch (type) {
      case 'property':
        return 'welcomeMessage';
      case 'tenant':
        return 'rentReminder';
      case 'payment':
        return 'paymentConfirmation';
      case 'maintenance':
        return 'maintenanceUpdate';
      case 'user':
        return 'teamInvite';
      default:
        return 'welcomeMessage';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MessageButtons
        phone={phone}
        email={email}
        name={name}
        messageType={getMessageType()}
        additionalData={additionalData}
      />
      {showShare && (
        <ShareButton
          title={name}
          text={getShareText()}
          type={type}
          data={data}
        />
      )}
    </div>
  );
};

export default MessageEverywhere;