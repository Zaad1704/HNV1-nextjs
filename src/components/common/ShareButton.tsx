import React, { useState } from 'react';
import { Share2, Copy, Mail, MessageCircle, Send, Download, QrCode } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url?: string;
  text?: string;
  data?: any;
  type?: 'property' | 'tenant' | 'payment' | 'report' | 'receipt' | 'general';
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  url = window.location.href, 
  text, 
  data, 
  type = 'general',
  className = '' 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = text || `Check out this ${type}: ${title}`;
  const shareUrl = url;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  const handleTelegramShare = () => {
    const message = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? QrCode : Copy,
      action: handleCopyLink,
      color: 'text-blue-600'
    },
    {
      name: 'Email',
      icon: Mail,
      action: handleEmailShare,
      color: 'text-red-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: handleWhatsAppShare,
      color: 'text-green-600'
    },
    {
      name: 'Telegram',
      icon: Send,
      action: handleTelegramShare,
      color: 'text-blue-500'
    }
  ];

  // Add native share if available
  if (navigator.share) {
    shareOptions.unshift({
      name: 'Share',
      icon: Share2,
      action: handleNativeShare,
      color: 'text-purple-600'
    });
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        title="Share"
      >
        <Share2 size={16} />
        Share
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 bottom-full mb-2 backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-lg shadow-2xl z-[9999] min-w-[160px]" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
          {shareOptions.map((option, index) => (
            <button
              key={option.name}
              onClick={() => {
                option.action();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <option.icon size={16} className={option.color} />
              <span className="text-gray-700">
                {option.name === 'Copy Link' && copied ? 'Copied!' : option.name}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;