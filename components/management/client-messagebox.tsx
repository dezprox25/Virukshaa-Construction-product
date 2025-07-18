import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, MessageSquare, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'client' | 'superadmin';
  timestamp: Date;
}

const ClientMessageBoxManagement = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample initial messages (replace with actual data from your backend)
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Hello! How can I help you today?',
        sender: 'superadmin',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        text: 'I have a question about my project timeline.',
        sender: 'client',
        timestamp: new Date(Date.now() - 1800000)
      }
    ]);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'client',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-50 rounded-lg overflow-hidden border">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <h2 className="font-semibold">Super Admin</h2>
          <p className="text-xs opacity-80">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.sender === 'client'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 text-right mt-1">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-3 bg-white">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full px-4 py-2"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90"
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientMessageBoxManagement;