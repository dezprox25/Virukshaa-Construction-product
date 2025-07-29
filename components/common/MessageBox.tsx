import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, ArrowLeft, MoreVertical, Paperclip, Mic, Smile } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  sender: 'client' | 'superadmin';
  timestamp: Date;
  conversationId?: string;
  read?: boolean;
}

interface MessageBoxProps {
  userType: 'client' | 'admin';
  title: string;
  conversationId: string;
  onBack?: () => void;
  className?: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  userType,
  title,
  conversationId,
  onBack,
  className = '',
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages for the conversation from localStorage
  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem(`messages-${conversationId}`);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
    setIsLoading(false);
  }, [conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId) return;

    const msgObj: Message = {
      id: Date.now().toString() + Math.random().toString(),
      text: message,
      sender: userType === 'admin' ? 'superadmin' : 'client',
      conversationId,
      timestamp: new Date(),
      read: true,
    };

    setMessages(prev => {
      const updated = [...prev, msgObj];
      localStorage.setItem(`messages-${conversationId}` , JSON.stringify(updated));
      return updated;
    });
    setMessage('');
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-[#e5ddd5] bg-opacity-30">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-[#e5ddd5] max-h-[700px] bg-opacity-30 ${className}`}>
      {/* Header */}
      <div className="bg-[#00a884] p-3 flex items-center justify-between text-white">
        <div className="flex items-center">
          {onBack && (
            <button 
              onClick={onBack} 
              className="p-2 mr-2 rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="ml-3">
            <h2 className="font-medium">{title}</h2>
            <p className="text-xs opacity-80">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat background with pattern */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] bg-opacity-30"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === (userType === 'admin' ? 'superadmin' : 'client')
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === (userType === 'admin' ? 'superadmin' : 'client')
                      ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none shadow-sm'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className="text-xs text-gray-500 text-right mt-1 flex justify-end items-center space-x-1">
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.read && (
                      <span className="text-blue-500">
                        ✓✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[#f0f2f5] p-3 border-t border-gray-300">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
          >
            <Smile className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
          >
            <Paperclip className="h-6 w-6" />
          </button>
          <div className="flex-1 mx-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full rounded-full border-0 bg-white px-4 py-2 focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </div>
          {message.trim() ? (
            <button
              type="submit"
              className="p-2 text-white bg-[#00a884] rounded-full hover:bg-[#128c7e]"
            >
              <Send className="h-6 w-6" />
            </button>
          ) : (
            <button
              type="button"
              className="p-2 text-white bg-[#00a884] rounded-full hover:bg-[#128c7e]"
            >
              <Mic className="h-6 w-6" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default MessageBox;
