'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  sender: 'client' | 'superadmin';
  timestamp: string;
  conversationId: string;
  read: boolean;
}

export interface MessageBoxProps {
  userType: 'client' | 'admin';
  title?: string;
  conversationId: string;
  onBack?: () => void;
  className?: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  userType,
  conversationId,
  title,
  onBack,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        console.error('Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Poll every 3 seconds for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const payload = {
      text: message,
      sender: userType === 'admin' ? 'superadmin' : 'client',
      conversationId,
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentSender = userType === 'admin' ? 'superadmin' : 'client';

  return (
    <div className={`max-w-2xl mx-auto border rounded shadow flex flex-col h-[600px] ${className}`}>
      {/* Optional header */}
      {title && (
        <div className="p-4 border-b bg-white font-semibold text-lg flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-600 text-sm mr-4">
              ← Back
            </button>
          )}
          {title}
        </div>
      )}

      {/* Message body */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm">No messages yet</p>
        )}
        {messages.map((msg) => {
          const isOwnMessage = msg.sender === currentSender;
          return (
            <div
              key={msg.id}
              className={`flex mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded px-4 py-2 text-sm max-w-[75%] ${
                  isOwnMessage ? 'bg-green-100' : 'bg-white'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] text-gray-500 block text-right mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-white flex items-center">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 mr-2"
        />
        <Button type="submit" disabled={loading || !message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageBox;
