import React from 'react';

interface QRCodeGeneratorProps {
  text: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ text, size = 200, className = '' }) => {
  // Generate QR code URL using a free service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  
  return (
    <div className={`flex justify-center ${className}`}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        className="border border-gray-200 rounded-lg"
        width={size}
        height={size}
      />
    </div>
  );
};

export default QRCodeGenerator;