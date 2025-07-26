import React from 'react';
import { MessageCircle, Mail, Phone, Calendar, Plus, Send, Paperclip, Star } from 'lucide-react';

interface CommunicationEntry {
  id: string;
  type: 'email' | 'sms' | 'call' | 'meeting' | 'note';
  subject: string;
  content: string;
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  attachments?: string[];
  priority: 'low' | 'normal' | 'high';
}

interface TenantCommunicationLogProps {
  tenantId: string;
  tenantName: string;
  className?: string;
}

const TenantCommunicationLog: React.FC<TenantCommunicationLogProps> = ({
  tenantId,
  tenantName,
  className = ''
}) => {
  const [communications, setCommunications] = React.useState<CommunicationEntry[]>([
    {
      id: '1',
      type: 'email',
      subject: 'Monthly Rent Reminder',
      content: 'This is a friendly reminder that your rent payment is due on the 1st of each month.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      direction: 'outbound',
      status: 'read',
      priority: 'normal'
    },
    {
      id: '2',
      type: 'sms',
      subject: 'Maintenance Update',
      content: 'Your maintenance request has been scheduled for tomorrow at 2 PM.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      direction: 'outbound',
      status: 'delivered',
      priority: 'high'
    },
    {
      id: '3',
      type: 'call',
      subject: 'Lease Renewal Discussion',
      content: 'Discussed lease renewal terms and rent adjustment for next year.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      direction: 'inbound',
      status: 'sent',
      priority: 'high'
    }
  ]);

  const [showNewMessage, setShowNewMessage] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState({
    type: 'email',
    subject: '',
    content: '',
    priority: 'normal'
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={16} className="text-blue-500" />;
      case 'sms': return <MessageCircle size={16} className="text-green-500" />;
      case 'call': return <Phone size={16} className="text-purple-500" />;
      case 'meeting': return <Calendar size={16} className="text-orange-500" />;
      default: return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-gray-600';
      case 'delivered': return 'text-blue-600';
      case 'read': return 'text-green-600';
      case 'replied': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleSendMessage = () => {
    const message: CommunicationEntry = {
      id: Date.now().toString(),
      type: newMessage.type as any,
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date(),
      direction: 'outbound',
      status: 'sent',
      priority: newMessage.priority as any
    };

    setCommunications(prev => [message, ...prev]);
    setNewMessage({ type: 'email', subject: '', content: '', priority: 'normal' });
    setShowNewMessage(false);
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Communication Log</h3>
              <p className="text-sm text-gray-600">All interactions with {tenantName}</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewMessage(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            <Plus size={16} />
            New Message
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Communication Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{communications.filter(c => c.type === 'email').length}</div>
            <div className="text-sm text-gray-600">Emails</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{communications.filter(c => c.type === 'sms').length}</div>
            <div className="text-sm text-gray-600">SMS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{communications.filter(c => c.type === 'call').length}</div>
            <div className="text-sm text-gray-600">Calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{communications.filter(c => c.direction === 'inbound').length}</div>
            <div className="text-sm text-gray-600">Inbound</div>
          </div>
        </div>

        {/* Communication Timeline */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {communications.map((comm) => (
            <div
              key={comm.id}
              className={`border-l-4 p-4 rounded-r-xl ${getPriorityColor(comm.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getTypeIcon(comm.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{comm.subject}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{comm.timestamp.toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{comm.direction}</span>
                      <span>•</span>
                      <span className={`capitalize ${getStatusColor(comm.status)}`}>{comm.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {comm.priority === 'high' && (
                    <Star size={14} className="text-red-500" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comm.direction === 'inbound' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {comm.direction}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{comm.content}</p>
              {comm.attachments && comm.attachments.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <Paperclip size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{comm.attachments.length} attachment(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {communications.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Communications Yet</h3>
            <p className="text-gray-600 mb-4">Start a conversation with {tenantName}</p>
            <button
              onClick={() => setShowNewMessage(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              Send First Message
            </button>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">New Message</h3>
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="call">Phone Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter your message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage({...newMessage, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.subject || !newMessage.content}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantCommunicationLog;