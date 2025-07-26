import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Send, X, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api';

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  status: 'active' | 'closed';
  lastMessage: string;
  lastActivity: Date;
  unreadCount: number;
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  senderName: string;
}

const AdminChatPanel: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatSessions();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadChatSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadChatSessions = async () => {
    try {
      const { data } = await apiClient.get('/super-admin/chat-sessions');
      if (data.success) {
        setChatSessions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      // Mock data for demo
      setChatSessions([
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          userRole: 'Landlord',
          status: 'active',
          lastMessage: 'I need help with tenant management',
          lastActivity: new Date(),
          unreadCount: 2,
          messages: [
            {
              id: '1',
              text: 'Hello, I need help with tenant management',
              sender: 'user',
              timestamp: new Date(Date.now() - 300000),
              senderName: 'John Doe'
            },
            {
              id: '2',
              text: 'How do I add a new tenant to my property?',
              sender: 'user',
              timestamp: new Date(),
              senderName: 'John Doe'
            }
          ]
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Jane Smith',
          userRole: 'Agent',
          status: 'active',
          lastMessage: 'Payment processing issue',
          lastActivity: new Date(Date.now() - 600000),
          unreadCount: 1,
          messages: [
            {
              id: '3',
              text: 'I\'m having trouble processing payments',
              sender: 'user',
              timestamp: new Date(Date.now() - 600000),
              senderName: 'Jane Smith'
            }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      senderName: 'Support Admin'
    };

    // Update local state
    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message]
    } : null);

    setChatSessions(prev => prev.map(session => 
      session.id === activeSession.id 
        ? { ...session, lastMessage: newMessage, lastActivity: new Date() }
        : session
    ));

    try {
      await apiClient.post('/super-admin/send-chat-message', {
        sessionId: activeSession.id,
        message: newMessage,
        userId: activeSession.userId
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    setNewMessage('');
  };

  const closeSession = async (sessionId: string) => {
    try {
      await apiClient.patch(`/super-admin/chat-sessions/${sessionId}/close`);
      setChatSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status: 'closed' } : session
      ));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Failed to close session:', error);
    }
  };

  const totalUnread = chatSessions.reduce((sum, session) => sum + session.unreadCount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading chat sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Live Chat Support</h1>
          <p className="text-text-secondary mt-1">
            Manage user support conversations ({totalUnread} unread)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-text-secondary">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Chat Sessions List */}
        <div className="lg:col-span-1 app-surface rounded-3xl p-6 border border-app-border overflow-y-auto">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Users size={20} />
            Active Chats ({chatSessions.filter(s => s.status === 'active').length})
          </h2>
          
          {chatSessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={32} className="text-text-muted mx-auto mb-2" />
              <p className="text-text-secondary text-sm">No active chat sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatSessions.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveSession(session)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all ${
                    activeSession?.id === session.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-app-bg hover:bg-app-surface border border-app-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 app-gradient rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {session.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">{session.userName}</p>
                        <p className="text-xs text-text-secondary">{session.userRole}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {session.unreadCount}
                        </div>
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary truncate">{session.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-text-muted">
                      {new Date(session.lastActivity).toLocaleTimeString()}
                    </p>
                    {session.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeSession(session.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 app-surface rounded-3xl border border-app-border flex flex-col">
          {activeSession ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-app-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                    {activeSession.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{activeSession.userName}</h3>
                    <p className="text-sm text-text-secondary">{activeSession.userRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Clock size={14} />
                    {new Date(activeSession.lastActivity).toLocaleString()}
                  </div>
                  <button
                    onClick={() => closeSession(activeSession.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {activeSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.sender === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-app-border">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-3 border border-app-border rounded-2xl bg-app-surface focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send size={16} />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={48} className="text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">Select a Chat</h3>
                <p className="text-text-secondary">Choose a chat session to start responding to users</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPanel;