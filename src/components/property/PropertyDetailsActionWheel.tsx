import React, { useState } from 'react';
import { Edit, Eye, Share2, Home, Wrench, Archive, MessageCircle, Bell, BarChart3, Download, FileText, AlertTriangle, Trash2 } from 'lucide-react';

interface PropertyDetailsActionWheelProps {
  property: any;
  onEdit: () => void;
  onView: () => void;
  onShare: () => void;
  onUnits: () => void;
  onMaintenance: () => void;
  onArchive: () => void;
  onMessage: () => void;
  onNotifications: () => void;
  onAnalytics: () => void;
  onExport: () => void;
  onCollectionSheet: () => void;
  onDelete: () => void;
}

const PropertyDetailsActionWheel: React.FC<PropertyDetailsActionWheelProps> = ({
  property, onEdit, onView, onShare, onUnits, onMaintenance, onArchive,
  onMessage, onNotifications, onAnalytics, onExport, onCollectionSheet, onDelete
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'quick',
      title: 'Quick Actions',
      color: 'from-blue-500/30 to-cyan-500/30',
      actions: [
        { icon: Edit, label: 'Edit Property', onClick: onEdit },
        { icon: Eye, label: 'View Details', onClick: onView },
        { icon: Share2, label: 'Share', onClick: onShare }
      ]
    },
    {
      id: 'management',
      title: 'Property Management',
      color: 'from-green-500/30 to-emerald-500/30',
      actions: [
        { icon: Home, label: 'Manage Units', onClick: onUnits },
        { icon: Wrench, label: 'Maintenance', onClick: onMaintenance },
        { icon: Archive, label: 'Archive', onClick: onArchive }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      color: 'from-purple-500/30 to-pink-500/30',
      actions: [
        { icon: MessageCircle, label: 'Message Tenants', onClick: onMessage },
        { icon: Bell, label: 'Notifications', onClick: onNotifications }
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      color: 'from-orange-500/30 to-yellow-500/30',
      actions: [
        { icon: BarChart3, label: 'Analytics', onClick: onAnalytics },
        { icon: Download, label: 'Export Data', onClick: onExport },
        { icon: FileText, label: 'Collection Sheet', onClick: onCollectionSheet }
      ]
    },
    {
      id: 'danger',
      title: 'Danger Zone',
      color: 'from-red-500/30 to-pink-500/30',
      actions: [
        { icon: Trash2, label: 'Delete Property', onClick: onDelete }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="rounded-2xl border border-white/30 overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)'}}>
          <button
            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <h3 className="font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{section.title}</h3>
            <div className={`w-6 h-6 rounded-full transition-transform ${activeSection === section.id ? 'rotate-180' : ''}`} style={{background: section.color}}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </button>
          
          {activeSection === section.id && (
            <div className="p-4 pt-0 space-y-2">
              {section.actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-white group"
                    style={{background: 'rgba(255, 255, 255, 0.05)'}}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{background: section.color}}>
                      <Icon size={18} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'}} />
                    </div>
                    <span className="font-medium" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PropertyDetailsActionWheel;